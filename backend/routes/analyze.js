import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const router = express.Router();

function buildSystemPrompt(celebrityName) {
  const celebrityContext = celebrityName
    ? `분석 대상은 "${celebrityName}"입니다. 이 연예인의 평소 패션 스타일, 선호 브랜드, 가격대를 고려하여 분석해주세요.`
    : '';

  return `당신은 명품 및 패션 브랜드에 정통한 스타일리스트입니다. 사진 속 인물이 착용한 의류 아이템들을 전문가 시각으로 분석해주세요.
${celebrityContext}

각 아이템에 대해 다음 JSON 배열 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

[
  {
    "id": 1,
    "category": "아우터 | 상의 | 하의 | 신발 | 가방 | 액세서리 중 하나",
    "name": "아이템 이름 (예: 트렌치코트)",
    "description": "스타일 설명 (예: 더블브레스트 벨트 트렌치코트)",
    "color": "주요 색상",
    "material": "소재 (확실하지 않으면 추정)",
    "brand": "추정 브랜드명 (확실하지 않으면 null)",
    "priceTier": "럭셔리 | 중가 | 저가",
    "estimatedPrice": 숫자 (원화 기준 중간값, 예: 850000),
    "searchQuery": "네이버 쇼핑 검색에 최적화된 한국어 검색어"
  }
]

가격 기준:
- 럭셔리: 50만원 이상 (명품, 디자이너 브랜드)
- 중가: 5만원~50만원 (일반 브랜드, 편집샵)
- 저가: 5만원 미만 (SPA, 온라인 쇼핑몰)

- 사람이 착용한 모든 아이템을 빠짐없이 포함하세요
- 브랜드 로고, 디자인 특징, 소재감으로 브랜드를 추정하세요
- estimatedPrice는 한국 시장 기준 해당 아이템의 실제 구매 가능한 현실적인 금액으로 작성하세요
- searchQuery는 priceTier를 반영한 실용적인 검색어로 작성하세요 (럭셔리면 브랜드명 포함, 저가면 "저렴한" 키워드 활용)`;
}

router.post('/', async (req, res) => {
  const { image, mediaType, celebrityName } = req.body;

  if (!image) {
    return res.status(400).json({ error: '이미지가 없습니다.' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: buildSystemPrompt(celebrityName),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: image,
              },
            },
            {
              type: 'text',
              text: celebrityName
                ? `${celebrityName}의 이 공항패션 사진에서 착용한 의류 아이템들을 분석해주세요.`
                : '이 사진에서 착용한 의류 아이템들을 분석해주세요.',
            },
          ],
        },
      ],
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: '분석 결과를 파싱할 수 없습니다.' });
    }

    const items = JSON.parse(jsonMatch[0]);
    res.json({ items });
  } catch (err) {
    console.error('Claude API 오류:', err);
    res.status(500).json({ error: '분석 중 오류가 발생했습니다.' });
  }
});

export default router;
