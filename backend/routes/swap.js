import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { Client, handle_file } from '@gradio/client';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Claude로 두 사람 옷 분석
async function analyzeOutfits(imageA, mediaTypeA, nameA, imageB, mediaTypeB, nameB) {
  const prompt = `두 사람의 패션 사진을 분석해줘.

사진 1: ${nameA}
사진 2: ${nameB}

다음 JSON 형식으로 응답해:
{
  "personA": {
    "name": "${nameA}",
    "outfit": {
      "summary": "전체 스타일 한 줄 요약",
      "style": "미니멀/캐주얼/페미닌/걸리시/포멀/스트릿 중 하나",
      "mood": "스타일 무드",
      "garmentDesc": "의상 전체를 영어로 상세 묘사 (IDM-VTON 모델용)",
      "category": "upper_body 또는 lower_body 또는 dresses 중 가장 적합한 것",
      "items": [
        { "category": "아우터/상의/하의/신발/가방/액세서리 중 하나", "name": "아이템명", "color": "색상", "description": "설명", "searchQuery": "네이버쇼핑 검색어" }
      ]
    }
  },
  "personB": {
    "name": "${nameB}",
    "outfit": {
      "summary": "전체 스타일 한 줄 요약",
      "style": "미니멀/캐주얼/페미닌/걸리시/포멀/스트릿 중 하나",
      "mood": "스타일 무드",
      "garmentDesc": "의상 전체를 영어로 상세 묘사 (IDM-VTON 모델용)",
      "category": "upper_body 또는 lower_body 또는 dresses 중 가장 적합한 것",
      "items": [
        { "category": "아우터/상의/하의/신발/가방/액세서리 중 하나", "name": "아이템명", "color": "색상", "description": "설명", "searchQuery": "네이버쇼핑 검색어" }
      ]
    }
  },
  "swapA": {
    "description": "${nameA}이/가 ${nameB}의 옷을 입으면 어떤 느낌일지 2문장 묘사",
    "styleComment": "어울리는지 코멘트"
  },
  "swapB": {
    "description": "${nameB}이/가 ${nameA}의 옷을 입으면 어떤 느낌일지 2문장 묘사",
    "styleComment": "어울리는지 코멘트"
  }
}

JSON만 응답해. 마크다운 없이.`;

  async function callWithRetry(params, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await anthropic.messages.create(params);
      } catch (e) {
        if ((e.status === 529 || e.message?.includes('overloaded')) && i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, (i + 1) * 3000));
          continue;
        }
        throw e;
      }
    }
  }

  const response = await callWithRetry({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaTypeA, data: imageA } },
        { type: 'image', source: { type: 'base64', media_type: mediaTypeB, data: imageB } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  let text = response.content[0].text.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(text);
}

// HuggingFace Spaces IDM-VTON으로 합성 이미지 생성
async function generateTryOn(humanImageBase64, humanMediaType, garmentImageBase64, garmentMediaType, garmentDesc, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await _generateTryOnOnce(humanImageBase64, humanMediaType, garmentImageBase64, garmentMediaType, garmentDesc);
    } catch (e) {
      const isGpuError = e.message?.includes('No GPU was available') || e.message?.includes('quota');
      if (isGpuError && attempt < retries) {
        console.log(`GPU 미사용 가능 (시도 ${attempt}/${retries}), 8초 후 재시도...`);
        await new Promise(r => setTimeout(r, 8000));
        continue;
      }
      throw e;
    }
  }
}

async function _generateTryOnOnce(humanImageBase64, humanMediaType, garmentImageBase64, garmentMediaType, garmentDesc) {
  const humanBlob = new Blob(
    [Buffer.from(humanImageBase64, 'base64')],
    { type: humanMediaType }
  );
  const garmentBlob = new Blob(
    [Buffer.from(garmentImageBase64, 'base64')],
    { type: garmentMediaType }
  );

  const hfToken = process.env.HF_TOKEN;
  console.log(`HF 토큰: ${hfToken ? hfToken.slice(0, 10) + '...' : '없음'}`);

  // hf_token 과 headers 두 방식 모두 시도
  const connectOptions = hfToken
    ? { hf_token: hfToken, headers: { Authorization: `Bearer ${hfToken}` } }
    : {};

  const app = await Client.connect('yisol/IDM-VTON', connectOptions);
  console.log('Space 연결 완료, 예측 시작...');

  const result = await app.predict('/tryon', {
    dict: { background: handle_file(humanBlob), layers: [], composite: null },
    garm_img: handle_file(garmentBlob),
    garment_des: garmentDesc || 'fashion outfit',
    is_checked: true,
    is_checked_crop: false,
    denoise_steps: 30,
    seed: 42,
  });

  const output = result.data?.[0];
  if (!output) throw new Error('HuggingFace Space에서 결과를 받지 못했습니다.');

  const imageUrl = typeof output === 'string' ? output : output.url;

  // CORS 우회: 백엔드에서 이미지 다운로드 후 base64로 변환
  const imgRes = await fetch(imageUrl, {
    headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
  });
  if (!imgRes.ok) throw new Error(`이미지 다운로드 실패: ${imgRes.status}`);

  const arrayBuffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const contentType = imgRes.headers.get('content-type') || 'image/png';

  return `data:${contentType};base64,${base64}`;
}

// POST /api/swap
router.post('/', async (req, res) => {
  const { imageA, mediaTypeA, nameA = 'A', imageB, mediaTypeB, nameB = 'B' } = req.body;
  if (!imageA || !imageB) return res.status(400).json({ error: '이미지 두 장이 필요합니다.' });

  try {
    // 1단계: Claude 분석
    console.log('Claude 분석 중...');
    const analysis = await analyzeOutfits(imageA, mediaTypeA, nameA, imageB, mediaTypeB, nameB);

    // 2단계: HuggingFace Spaces IDM-VTON 합성 (실패해도 분석 결과는 반환)
    // GPU 경쟁 방지를 위해 순차 실행
    let generatedA = null, generatedB = null;

    console.log('A 합성 시작...');
    try {
      generatedA = await generateTryOn(imageA, mediaTypeA, imageB, mediaTypeB, analysis.personB.outfit.garmentDesc);
      console.log('A 합성 완료');
    } catch (e) {
      console.error('A 합성 오류:', e.message);
    }

    console.log('B 합성 시작 전 5초 대기...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('B 합성 시작...');
    try {
      generatedB = await generateTryOn(imageB, mediaTypeB, imageA, mediaTypeA, analysis.personA.outfit.garmentDesc);
      console.log('B 합성 완료');
    } catch (e) {
      console.error('B 합성 오류:', e.message);
    }

    // 합성 실패해도 Claude 분석 결과는 정상 반환
    res.json({
      ...analysis,
      generatedA,
      generatedB,
    });
  } catch (e) {
    console.error('Swap 분석 오류:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
