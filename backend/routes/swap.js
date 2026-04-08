import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

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

const IDM_VTON_VERSION = '0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985';

// Replicate IDM-VTON으로 합성 이미지 생성
async function generateTryOn(humanImageBase64, humanMediaType, garmentImageBase64, garmentMediaType, garmentDesc, category) {
  const humanDataUri = `data:${humanMediaType};base64,${humanImageBase64}`;
  const garmentDataUri = `data:${garmentMediaType};base64,${garmentImageBase64}`;

  let prediction = await replicate.predictions.create({
    version: IDM_VTON_VERSION,
    input: {
      human_img: humanDataUri,
      garm_img: garmentDataUri,
      garment_des: garmentDesc || 'fashion outfit',
      is_checked: true,
      is_checked_crop: false,
      denoise_steps: 30,
      seed: 42,
    },
  });

  prediction = await replicate.wait(prediction);

  const output = prediction.output;
  if (Array.isArray(output)) return output[0];
  return output;
}

// POST /api/swap
router.post('/', async (req, res) => {
  const { imageA, mediaTypeA, nameA = 'A', imageB, mediaTypeB, nameB = 'B' } = req.body;
  if (!imageA || !imageB) return res.status(400).json({ error: '이미지 두 장이 필요합니다.' });

  try {
    // 1단계: Claude 분석
    console.log('Claude 분석 중...');
    const analysis = await analyzeOutfits(imageA, mediaTypeA, nameA, imageB, mediaTypeB, nameB);

    // 2단계: Replicate 합성 (순차 실행 — 무료 계정 rate limit 대응)
    console.log('Replicate 합성 이미지 생성 중...');
    let generatedA = null, generatedB = null;

    try {
      generatedA = await generateTryOn(
        imageA, mediaTypeA,
        imageB, mediaTypeB,
        analysis.personB.outfit.garmentDesc,
        analysis.personB.outfit.category,
      );
      console.log('A 합성 완료:', generatedA);
    } catch (e) {
      console.error('A 합성 오류:', e.message);
    }

    // rate limit 방지 대기
    await new Promise(r => setTimeout(r, 3000));

    try {
      generatedB = await generateTryOn(
        imageB, mediaTypeB,
        imageA, mediaTypeA,
        analysis.personA.outfit.garmentDesc,
        analysis.personA.outfit.category,
      );
      console.log('B 합성 완료:', generatedB);
    } catch (e) {
      console.error('B 합성 오류:', e.message);
    }

    res.json({
      ...analysis,
      generatedA,  // A가 B 옷 입은 이미지 URL
      generatedB,  // B가 A 옷 입은 이미지 URL
    });
  } catch (e) {
    console.error('Swap 분석 오류:', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
