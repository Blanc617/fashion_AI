import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', async (req, res) => {
  const { image, mediaType } = req.body;
  if (!image) return res.status(400).json({ error: '이미지가 없습니다.' });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: `당신은 퍼스널 컬러 전문가입니다. 사진 속 인물의 타고난 신체 색상(피부 언더톤, 머리카락 색, 눈동자 색)만을 보고 퍼스널 컬러를 진단하세요.

중요: 의상 색상은 절대 분석하지 마세요. 오직 피부, 머리카락, 눈동자만 보세요.

분석 기준:
- 피부 언더톤: 노란기(웜) vs 분홍/푸른기(쿨), 혈관 색(녹색=웜, 파란색=쿨)
- 봄 웜톤: 밝고 투명한 피부, 골드빛 언더톤, 밝은 갈색/황금색 머리카락
- 여름 쿨톤: 핑크빛 피부, 쿨한 언더톤, 회갈색/쿨브라운 머리카락
- 가을 웜톤: 황금빛/올리브 피부, 깊은 웜 언더톤, 진한 갈색/구릿빛 머리카락
- 겨울 쿨톤: 쿨하고 선명한 피부, 블루/핑크 언더톤, 검정/짙은 머리카락

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

{
  "season": "봄 웜톤 | 여름 쿨톤 | 가을 웜톤 | 겨울 쿨톤 중 하나",
  "tone": "웜톤 | 쿨톤",
  "skinAnalysis": "피부 언더톤 분석 1문장",
  "description": "피부톤, 머리카락, 눈동자를 근거로 한 퍼스널 컬러 진단 설명 2~3문장",
  "bestColors": ["잘 어울리는 색상 5가지 (한국어)"],
  "worstColors": ["피해야 할 색상 3가지 (한국어)"],
  "bestColorHex": ["잘 어울리는 색상 5가지의 hex 코드"],
  "worstColorHex": ["피해야 할 색상 3가지의 hex 코드"],
  "fashionTips": ["이 퍼스널 컬러에 맞는 패션 팁 3가지"],
  "matchingCelebrities": ["비슷한 퍼스널 컬러를 가진 한국 연예인 2~3명"]
}`,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image },
          },
          {
            type: 'text',
            text: '이 사진 속 인물의 피부 언더톤, 머리카락 색, 눈동자 색을 근거로 퍼스널 컬러를 진단해주세요. 의상 색상은 무시하세요.',
          },
        ],
      }],
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: '분석 결과를 파싱할 수 없습니다.' });

    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('퍼스널 컬러 분석 오류:', err);
    res.status(500).json({ error: '분석 중 오류가 발생했습니다.' });
  }
});

export default router;
