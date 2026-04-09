import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BODY_TYPE_DATA = {
  straight: {
    name: '스트레이트형',
    emoji: '💎',
    description: '상체에 볼륨이 있고 탄탄한 느낌. 어깨와 가슴이 발달하고 직선적인 실루엣.',
    representative: '제니',
    keyword: '깔끔 + 핏감',
    recommend: [
      { label: '슬림핏 상의', query: '여성 슬림핏 크롭 상의' },
      { label: '스트레이트 팬츠', query: '여성 스트레이트 팬츠' },
      { label: '테일러드 재킷', query: '여성 테일러드 재킷' },
      { label: '크롭 니트', query: '여성 크롭 니트' },
      { label: 'V넥 상의', query: '여성 브이넥 티셔츠' },
    ],
    avoid: ['과한 프릴·러플', '지나치게 루즈한 오버핏', '허리 강조 없는 직선형 원피스'],
    tips: ['상하체 비율을 균형있게 맞추는 스타일', '소재는 탄탄한 코튼·데님이 잘 어울림', 'V넥이나 오픈칼라로 상체를 가볍게'],
  },
  wave: {
    name: '웨이브형',
    emoji: '🌸',
    description: '여리하고 곡선적인 실루엣. 하체 중심으로 볼륨이 있고 부드러운 느낌.',
    representative: '아이유',
    keyword: '허리 강조 + 부드러운 소재',
    recommend: [
      { label: '허리 강조 원피스', query: '여성 허리 강조 원피스' },
      { label: '하이웨스트 스커트', query: '여성 하이웨스트 스커트' },
      { label: '부드러운 블라우스', query: '여성 쉬폰 블라우스' },
      { label: 'A라인 스커트', query: '여성 에이라인 스커트' },
      { label: '크롭 카디건', query: '여성 크롭 카디건' },
    ],
    avoid: ['박시한 오버핏', '무거운 소재', '직선적인 H라인 실루엣'],
    tips: ['허리 라인을 살리는 스타일이 핵심', '쉬폰·실크 같은 부드러운 소재 추천', '하이웨스트로 하체 라인 정리'],
  },
  natural: {
    name: '내추럴형',
    emoji: '🧢',
    description: '골격이 크고 힙한 느낌. 뼈대가 발달해 있어 캐주얼하고 스트릿 스타일이 잘 어울림.',
    representative: '정호연',
    keyword: '오버핏 + 스트릿',
    recommend: [
      { label: '오버핏 상의', query: '여성 오버핏 티셔츠' },
      { label: '와이드 팬츠', query: '여성 와이드 팬츠' },
      { label: '루즈핏 자켓', query: '여성 루즈핏 자켓' },
      { label: '스트릿 후드티', query: '여성 오버핏 후드티' },
      { label: '카고 팬츠', query: '여성 카고 팬츠' },
    ],
    avoid: ['타이트한 미니스커트', '러블리한 프릴', '몸에 딱 붙는 스타일'],
    tips: ['큰 골격을 살리는 루즈핏이 핵심', '레이어링으로 캐주얼하게', '스니커즈·로퍼로 힙한 느낌 완성'],
  },
  straight_wave: {
    name: '스트레이트+웨이브 믹스형',
    emoji: '✨',
    description: '상체 볼륨이 있으면서 허리는 잘록한 글래머+여리 조합. 요즘 인스타에서 가장 많은 유형.',
    representative: '수지',
    keyword: '슬림핏 + 적당한 소재감',
    recommend: [
      { label: '슬림핏 원피스', query: '여성 슬림핏 원피스' },
      { label: '랩 원피스', query: '여성 랩 원피스' },
      { label: '크롭 상의', query: '여성 크롭 상의 하이웨스트' },
      { label: '니트 원피스', query: '여성 니트 원피스' },
      { label: '허리밴드 팬츠', query: '여성 허리밴드 슬림 팬츠' },
    ],
    avoid: ['완전 박시 오버핏', '완전 타이트 바디콘', '극단적인 스타일 모두'],
    tips: ['박시도 타이트도 아닌 슬림핏이 정답', '허리 라인을 살짝 강조하는 스타일', '너무 딱딱하지도 흐물하지도 않은 소재'],
  },
  wave_natural: {
    name: '웨이브+내추럴 여리힙형',
    emoji: '🧵',
    description: '뼈대는 있지만 전체적으로 마른 편. 여리하면서도 힙한 모델 느낌.',
    representative: '로제',
    keyword: '루즈핏 + 살짝 드러나는 스타일',
    recommend: [
      { label: '루즈핏 니트', query: '여성 루즈핏 니트' },
      { label: '와이드 팬츠', query: '여성 린넨 와이드 팬츠' },
      { label: '오프숄더 상의', query: '여성 오프숄더 상의' },
      { label: '린넨 셔츠', query: '여성 린넨 오버핏 셔츠' },
      { label: '미디 스커트', query: '여성 미디 스커트' },
    ],
    avoid: ['너무 단정한 오피스룩', '몸 꽉 잡는 바디콘', '지나치게 귀여운 스타일'],
    tips: ['루즈하면서도 살짝 드러나는 스타일이 핵심', '니트 + 와이드팬츠 조합이 잘 어울림', '레이어링으로 볼륨감 연출'],
  },
  straight_natural: {
    name: '스트레이트+내추럴 탄탄힙형',
    emoji: '🖤',
    description: '골격이 크고 근육질 느낌. 모델+운동선수 느낌의 탄탄한 체형.',
    representative: '제시',
    keyword: '크롭 + 와이드 + 스트릿',
    recommend: [
      { label: '크롭 상의', query: '여성 크롭 반팔 상의' },
      { label: '와이드 팬츠', query: '여성 와이드 데님 팬츠' },
      { label: '스트릿 자켓', query: '여성 스트릿 오버핏 자켓' },
      { label: '애슬레저 세트', query: '여성 애슬레저 운동복 세트' },
      { label: '오버핏 후드', query: '여성 오버핏 후드 집업' },
    ],
    avoid: ['과한 러블리 스타일', '프릴·레이스', '지나치게 여성스러운 미니 원피스'],
    tips: ['탄탄한 체형을 살리는 크롭 스타일', '스트릿·애슬레저 코드가 잘 어울림', '단색 위주로 깔끔하게'],
  },
  extreme_wave: {
    name: '웨이브 극강형 (완전 여리형)',
    emoji: '🎀',
    description: '골격이 작고 체구가 작은 완전한 여리 타입. 섬세하고 여성스러운 스타일이 잘 어울림.',
    representative: '태연',
    keyword: '미니멀 + 여성스러운 디테일',
    recommend: [
      { label: '하이웨스트 미니스커트', query: '여성 하이웨스트 미니스커트' },
      { label: '여성스러운 블라우스', query: '여성 러플 블라우스' },
      { label: '크롭 카디건', query: '여성 크롭 가디건' },
      { label: '미니 원피스', query: '여성 미니 원피스 여성스러운' },
      { label: '리본 디테일 아이템', query: '여성 리본 디테일 상의' },
    ],
    avoid: ['크게 오버핏', '무거운 소재', '남성스러운 스트릿 스타일'],
    tips: ['하이웨스트는 필수 아이템', '미니멀하면서 여성스러운 디테일 활용', '가벼운 소재로 여리한 느낌 극대화'],
  },
};

router.post('/', async (req, res) => {
  const { image, mediaType } = req.body;
  if (!image) return res.status(400).json({ error: '이미지가 없습니다.' });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `당신은 키오네틱 체형 분석 전문가입니다. 사진 속 인물의 골격, 비율, 살의 위치를 분석하여 체형을 분류하세요.

체형 분류 기준 (키·몸무게 X, 골격·비율·살 위치 기준):
- straight: 상체 볼륨, 어깨·가슴 발달, 탄탄하고 직선적 실루엣
- wave: 하체 중심 볼륨, 곡선적, 골격 작고 여린 느낌
- natural: 골격 크고 뼈대 발달, 힙하고 캐주얼한 느낌
- straight_wave: 상체 볼륨 있으나 허리 잘록, 글래머+여리 동시
- wave_natural: 뼈대 있으나 전체적으로 마름, 여리+힙 모델 느낌
- straight_natural: 골격 크고 근육 느낌, 탄탄한 운동선수 느낌
- extreme_wave: 골격 매우 작고 체구 작음, 완전 여린 느낌

다음 JSON 형식으로만 응답하세요:
{
  "type": "위 7개 중 하나",
  "confidence": "높음 | 보통 | 낮음",
  "reason": "골격과 비율을 근거로 한 분류 이유 2문장"
}`,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image } },
          { type: 'text', text: '이 사진 속 인물의 골격과 비율을 보고 체형을 분류해주세요. 의상은 무시하고 체형만 분석하세요.' },
        ],
      }],
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: '분석 결과를 파싱할 수 없습니다.' });

    const analysis = JSON.parse(jsonMatch[0]);
    const bodyInfo = BODY_TYPE_DATA[analysis.type] || BODY_TYPE_DATA['straight'];

    res.json({ ...analysis, ...bodyInfo });
  } catch (err) {
    console.error('체형 분석 오류:', err);
    res.status(500).json({ error: '분석 중 오류가 발생했습니다.' });
  }
});

export default router;
