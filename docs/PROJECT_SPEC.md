# PROJECT_SPEC・域ｭ｣貅紋ｻ墓ｧ假ｼ・

譛ｬ譖ｸ縺ｯ螳溯｣・ｒ譬ｹ諡縺ｨ縺励◆豁｣貅紋ｻ墓ｧ倥〒縺吶りｨ倩ｿｰ縺ｯ螳溯｣・°繧峨・騾・ｼ輔″縺ｧ縺ゅｊ縲∵耳貂ｬ縺ｯ蜷ｫ縺ｿ縺ｾ縺帙ｓ・亥推謇縺ｫ蜃ｺ蜈ｸ繝輔ぃ繧､繝ｫ/髢｢謨ｰ繧呈・險假ｼ峨・

## 繝峨Γ繧､繝ｳ繝｢繝・Ν・亥ｮ溯｣・ｺ匁侠・・

- Character・医く繝｣繝ｩ繧ｯ繧ｿ繝ｼ・・
  - 繝輔ぅ繝ｼ繝ｫ繝・ `id`, `ownerId`, `name`, `displayName`, `description?`, `isPublic`, `createdAt`, `updatedAt`, `deletedAt?`, `tags?: string[]`, `images?: CharacterImage[]`, `isFavorite?`
  - 蜃ｺ蜈ｸ: `packages/types/src/index.ts` 縺ｮ `export interface Character`
- CharacterImage・育ｫ九■邨ｵ逕ｻ蜒丞腰菴搾ｼ・
  - 繝輔ぅ繝ｼ繝ｫ繝・ `id`, `characterId`, `key`, `thumbKey?`, `width?`, `height?`, `contentType`, `size?`, `emotion: CharacterEmotion`, `emotionLabel?`, `pattern?`, `sortOrder: number`, `createdAt`, `updatedAt`
  - 蛯呵・ 荳ｦ縺ｳ鬆・・繝ｭ繝代ユ繧｣蜷阪・ `order` 縺ｧ縺ｯ縺ｪ縺・`sortOrder`
  - 蜃ｺ蜈ｸ: `packages/types/src/index.ts` 縺ｮ `export interface CharacterImage`
- Emotion・亥・謖呻ｼ・
  - 蛟､: `NEUTRAL | HAPPY | SAD | ANGRY | SURPRISED | FEAR | DISGUST | SHY | SLEEPY | THINKING | OTHER`
  - 譌･譛ｬ隱槭Λ繝吶Ν: `utils/characterLocales.ts` 縺ｮ `EMOTION_JP_LABEL` 繧呈ｭ｣縺ｨ縺吶ｋ
    - 萓・ 閾ｪ辟ｶ菴難ｼ・EUTRAL・・ 讌ｽ縺励＞・・APPY・・ 謔ｲ縺励＞・・AD・・ 諤偵ｊ・・NGRY・・ 鬩壹″・・URPRISED・・ 諱舌ｌ・・EAR・・ 雖梧が・・ISGUST・・ 辣ｧ繧鯉ｼ・HY・・ 逵縺・ｼ・LEEPY・・ 諤晄｡茨ｼ・HINKING・・ 縺昴・莉厄ｼ・THER・・
  - 蜃ｺ蜈ｸ: 蝙九・ `packages/types/src/index.ts` 縺ｮ `export type CharacterEmotion`縲∵律譛ｬ隱槭Λ繝吶Ν縺ｯ `apps/frontend/utils/characterLocales.ts`

## UI / 逕ｻ髱｢莉墓ｧ假ｼ亥ｮ溯｣・ｺ匁侠・・

- 繧ｿ繝悶リ繝難ｼ亥・騾夲ｼ・
  - 逕ｻ髱｢荳企Κ縺ｫ縲後い繧ｻ繝・ヨ・懊く繝｣繝ｩ繧ｯ繧ｿ繝ｼ縲阪ち繝悶ｒ陦ｨ遉ｺ
  - 蜃ｺ蜈ｸ: `apps/frontend/components/common/SectionTabs.vue`
- 蜈ｬ髢九ぐ繝｣繝ｩ繝ｪ繝ｼ
  - 繝代せ: `/assets`・医ち繝・ 繧｢繧ｻ繝・ヨ・懊く繝｣繝ｩ繧ｯ繧ｿ繝ｼ・・
  - 讀懃ｴ｢/繝輔ぅ繝ｫ繧ｿ: `q`, `contentType`, `primaryTag`, `tags`, `sort` 繧旦RL繧ｯ繧ｨ繝ｪ縺ｫ菫晄戟繝ｻ蠕ｩ蜈・
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/assets/index.vue`・医け繧ｨ繝ｪ蜷梧悄縺ｨ讀懃ｴ｢・峨～apps/frontend/composables/useAssets.ts`
- 繧｢繧ｻ繝・ヨ邂｡逅・
  - 繝代せ: `/my/assets`・医ち繝・ 繧｢繧ｻ繝・ヨ・懊く繝｣繝ｩ繧ｯ繧ｿ繝ｼ・・
  - 讀懃ｴ｢/繝輔ぅ繝ｫ繧ｿ: 荳願ｨ倥→蜷檎ｭ峨・繧ｯ繧ｨ繝ｪ蜷梧悄
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/my/assets/index.vue`
- 縺頑ｰ励↓蜈･繧・
  - 繝代せ: `/my/favorites`・医い繧ｻ繝・ヨ・峨・`/my/favorites/characters`・医く繝｣繝ｩ繧ｯ繧ｿ繝ｼ・・
  - 繧ｿ繝・ 繧｢繧ｻ繝・ヨ・懊く繝｣繝ｩ繧ｯ繧ｿ繝ｼ
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/my/favorites/characters.vue`
- 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ
  - 荳隕ｧ・亥・髢具ｼ・ `/characters`・医ち繝・ 繧｢繧ｻ繝・ヨ・懊く繝｣繝ｩ繧ｯ繧ｿ繝ｼ・・
    - 繧ｯ繧ｨ繝ｪ蜷梧悄: `q`, `tags`, `sort`
    - 蜃ｺ蜈ｸ: `apps/frontend/pages/characters/index.vue`
  - 隧ｳ邏ｰ・亥・髢具ｼ・ `/characters/[id]`
    - 逕ｻ蜒上け繝ｪ繝・け縺ｧ諡｡螟ｧ繝｢繝ｼ繝繝ｫ
    - 蜃ｺ蜈ｸ: `apps/frontend/pages/characters/[id].vue`, `apps/frontend/components/common/ImageLightbox.vue`
  - 繝槭う荳隕ｧ: `/my/characters`
    - 蜃ｺ蜈ｸ: `apps/frontend/pages/my/characters/index.vue`
  - 譁ｰ隕丈ｽ懈・: `/my/characters/new`
    - 繧ｿ繝・`UploadTabs` 繧貞茜逕ｨ・医後い繧ｻ繝・ヨ繧偵い繝・・繝ｭ繝ｼ繝会ｽ懊く繝｣繝ｩ繧ｯ繧ｿ繝ｼ繧剃ｽ懈・縲搾ｼ・
    - 蜃ｺ蜈ｸ: `apps/frontend/pages/my/characters/new.vue`, `apps/frontend/components/common/UploadTabs.vue`
  - 邱ｨ髮・ `/my/characters/[id]`
    - 遶九■邨ｵ繧ｫ繝ｼ繝峨・繝ｬ繧､繧｢繧ｦ繝・ 3繧ｫ繝ｩ繝・・d莉･荳翫〒3蛻暦ｼ・
    - 逕ｻ蜒上け繝ｪ繝・け縺ｧ諡｡螟ｧ繝｢繝ｼ繝繝ｫ・医ヵ繧ｩ繝ｼ繝謫堺ｽ懊〒縺ｯ髢九°縺ｪ縺・ｼ・
    - 邱ｨ髮・庄閭ｽ繝輔ぅ繝ｼ繝ｫ繝・ `emotion`・・num驕ｸ謚橸ｼ義emotionLabel`閾ｪ逕ｱ繝ｩ繝吶Ν・・ `pattern`・井ｻｻ諢乗枚蟄怜・・・ `sortOrder`・亥ｰ上＆縺・⊇縺ｩ蜈磯ｭ・・
    - 譁ｰ隕上い繝・・繝ｭ繝ｼ繝臥判蜒上・譛ｫ蟆ｾ縺ｫ霑ｽ蜉・域怙螟ｧ縺ｮ `sortOrder` + 1 繧剃ｻ倅ｸ趣ｼ・
    - 繝峨Λ繝・げ・・ラ繝ｭ繝・・縺ｧ蜈･譖ｿ縲～sortOrder` 繧・0..N-1 縺ｫ蜀肴治逡ｪ縺励※菫晏ｭ・
    - 菫晏ｭ倥ヨ繝ｼ繧ｹ繝茨ｼ丞炎髯､縺ｯ蜿悶ｊ豸医＠蜿ｯ閭ｽ繝医・繧ｹ繝茨ｼ・遘抵ｼ・
    - 蜃ｺ蜈ｸ: `apps/frontend/pages/my/characters/[id].vue`
- 蜈ｬ髢九ご繝ｼ繝
  - 荳隕ｧ・亥・髢具ｼ・ `/games`
    - 讀懃ｴ｢/荳ｦ縺ｳ譖ｿ縺・ `q`・医ち繧､繝医Ν/讎りｦ√・驛ｨ蛻・ｸ閾ｴ・・ `sort`・・new | updated | title`・・
    - URL繧ｯ繧ｨ繝ｪ蜷梧悄: `q`, `sort` 繧貞渚譏繝ｻ蠕ｩ蜈・ゆｸ肴ｭ｣縺ｪ `sort` 縺ｯ `new` 縺ｫ豁｣隕丞喧
    - 繧ｫ繧ｦ繝ｳ繧ｿ陦ｨ遉ｺ: `viewCount`・磯夢隕ｧ・・ `playCount`・医・繝ｬ繧､・峨ｒ繧ｫ繝ｼ繝牙・縺ｫ陦ｨ遉ｺ
    - 繧ｫ繝舌・陦ｨ遉ｺ: `coverAssetId` 縺瑚ｨｭ螳壹＆繧後※縺・ｋ蝣ｴ蜷医・逕ｻ蜒上し繝繝阪う繝ｫ繧定｡ｨ遉ｺ縲よ悴險ｭ螳・蜿門ｾ怜､ｱ謨玲凾縺ｯ繝励Ξ繝ｼ繧ｹ繝帙Ν繝繝ｼ陦ｨ遉ｺ繧堤ｶｭ謖・
    - 遨ｺ迥ｶ諷・ 讀懃ｴ｢縺ゅｊ0莉ｶ譎ゅ・縲梧擅莉ｶ縺ｫ荳閾ｴ縺吶ｋ蜈ｬ髢九ご繝ｼ繝縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲ゅ阪ｒ陦ｨ遉ｺ
    - 蜃ｺ蜈ｸ: `apps/frontend/pages/games/index.vue`, `apps/frontend/composables/useGames.ts`
  - 繝槭う荳隕ｧ・育ｮ｡逅・ｼ・ `/my/games`
    - 讀懃ｴ｢/荳ｦ縺ｳ譖ｿ縺・蜈ｬ髢狗憾諷・ `q`・医ち繧､繝医Ν/讎りｦ√・驛ｨ蛻・ｸ閾ｴ・・ `sort`・・updated | created | title | public`・・ `status`・・all | public | private`・・
    - URL繧ｯ繧ｨ繝ｪ蜷梧悄: `q`, `sort`, `status` 繧貞渚譏繝ｻ蠕ｩ蜈・ゆｸ肴ｭ｣縺ｪ `sort` / `status` 縺ｯ `updated` / `all` 縺ｫ豁｣隕丞喧
    - 讀懃ｴ｢遒ｺ螳・ 讀懃ｴ｢繝懊ち繝ｳ縺ｾ縺溘・ Enter 縺ｧ驕ｩ逕ｨ・亥・蜉帑ｸｭ蛟､縺ｨ驕ｩ逕ｨ貂医∩譚｡莉ｶ繧貞・髮｢・・
    - 繧ｫ繝舌・陦ｨ遉ｺ: `coverAssetId` 縺瑚ｨｭ螳壹＆繧後※縺・ｋ繧ｲ繝ｼ繝縺ｯ荳隕ｧ繧ｫ繝ｼ繝牙ｷｦ蛛ｴ縺ｫ蟆丞梛繧ｵ繝繝阪う繝ｫ繧定｡ｨ遉ｺ
    - 遨ｺ迥ｶ諷・ 讀懃ｴ｢/繝輔ぅ繝ｫ繧ｿ邨先棡0莉ｶ譎ゅ・縲梧擅莉ｶ縺ｫ荳閾ｴ縺吶ｋ閾ｪ菴懊ご繝ｼ繝縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲ゅ阪ｒ陦ｨ遉ｺ
    - 蜃ｺ蜈ｸ: `apps/frontend/pages/my/games/index.vue`, `apps/frontend/composables/useGames.ts`

## API 縺ｨ蝙具ｼ亥ｮ溯｣・・蜃ｺ蜈ｸ・・

- 蝙九・蜃ｺ蜈ｸ
  - 蜈ｱ騾壼梛: `packages/types/src/index.ts`・・Asset`, `Character`, `CharacterImage`, `CharacterEmotion` 縺ｪ縺ｩ・・
- 鄂ｲ蜷攻RL・・ET/PUT・・
  - GET・磯夢隕ｧ逕ｨ・・ `GET /uploads/signed-get?key=...&ttl=...` 竊・JSON `{ url }`
    - 蜃ｺ蜈ｸ: `apps/api/src/uploads/uploads.controller.ts#getSignedGetUrl`
  - PUT・医い繝・・繝ｭ繝ｼ繝臥畑・・ `POST /uploads/signed-url` 竊・逶ｴPUT縺ｾ縺溘・繝輔か繝ｼ繝POST縺ｮ諠・ｱ
    - 蜃ｺ蜈ｸ: `apps/api/src/uploads/uploads.controller.ts#getSignedUrl`
- 繧｢繧ｻ繝・ヨ・・avorites 蜷ｫ繧・・
  - 蜈ｬ髢倶ｸ隕ｧ: `GET /assets`縲∵､懃ｴ｢: `GET /search/assets`
    - 蜃ｺ蜈ｸ: `apps/frontend/composables/useAssets.ts`・・listPublic`, `searchMine`・峨→ `apps/api/src/search/search.controller.ts`
  - 縺頑ｰ励↓蜈･繧贋ｸ隕ｧ: `GET /favorites`・磯・蛻励・ `normalizeAssetFavorite` 縺ｧ豁｣隕丞喧・・
  - 縺頑ｰ励↓蜈･繧顔匳骭ｲ: `POST /assets/:id/favorite`
  - 縺頑ｰ励↓蜈･繧願ｧ｣髯､: `DELETE /assets/:id/favorite`
    - 蜃ｺ蜈ｸ: 繝輔Ο繝ｳ繝・`apps/frontend/composables/useAssets.ts`・・listFavorites`, `favorite`, `unfavorite`, `applyFavorites`・・ 繧ｵ繝ｼ繝・`apps/api/src/favorites/*.ts`
- 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ
  - 蜈ｬ髢倶ｸ隕ｧ: `GET /characters`・・publicOnly` 逵∫払譎ゅ・蜈ｬ髢九・縺ｿ・・
  - 蜈ｬ髢玖ｩｳ邏ｰ: `GET /characters/:id`
  - 菴懈・: `POST /my/characters`
  - 蜿門ｾ暦ｼ郁・蛻・ｼ・ `GET /my/characters/:id`
  - 譖ｴ譁ｰ: `PATCH /my/characters/:id`
  - 蜑企勁: `DELETE /my/characters/:id`
  - 逕ｻ蜒上Γ繧ｿ霑ｽ蜉: `POST /my/characters/:id/images`
  - 逕ｻ蜒上Γ繧ｿ譖ｴ譁ｰ: `PATCH /my/characters/:id/images/:imageId`
  - 逕ｻ蜒丞炎髯､: `DELETE /my/characters/:id/images/:imageId`
    - 蜃ｺ蜈ｸ: `apps/frontend/composables/useCharacters.ts` 縺ｨ `apps/api/src/characters/*.controller.ts`
  - 縺頑ｰ励↓蜈･繧顔匳骭ｲ: `POST /characters/:id/favorite`
  - 縺頑ｰ励↓蜈･繧願ｧ｣髯､: `DELETE /characters/:id/favorite`
  - 縺頑ｰ励↓蜈･繧贋ｸ隕ｧ・医く繝｣繝ｩ・・ `GET /my/favorites/characters`
    - 蜃ｺ蜈ｸ: 繝輔Ο繝ｳ繝・`apps/frontend/composables/useCharacters.ts`・・favorite`, `unfavorite`, `listFavorites`・・ 繧ｵ繝ｼ繝・`apps/api/src/characters/character-favorites.*`
- 蜈ｬ髢九ご繝ｼ繝
  - 蜈ｬ髢倶ｸ隕ｧ: `GET /games`
    - 繧ｯ繧ｨ繝ｪ: `limit`, `offset`, `q`, `sort`
    - `q`: 遨ｺ逋ｽtrim蠕後↓遨ｺ縺ｧ縺ｪ縺代ｌ縺ｰ `title` / `summary` 縺ｮ驛ｨ蛻・ｸ閾ｴ讀懃ｴ｢・亥､ｧ譁・ｭ怜ｰ乗枚蟄鈴撼蛹ｺ蛻･・・
    - `sort`: `new`・・createdAt desc`・・ `updated`・・updatedAt desc`・・ `title`・・title asc`, `createdAt desc`・・
    - 荳肴ｭ｣縺ｪ `sort` 縺ｯ `new` 縺ｨ縺励※謇ｱ縺・
    - 霑泌唆縺ｯ蜈ｬ髢九ご繝ｼ繝縺ｮ縺ｿ・・isPublic = true`, `deletedAt = null`・・
    - `items[*]` 縺ｯ `coverAssetId` / `viewCount` / `playCount` 繧貞性繧
  - 蜈ｬ髢玖ｩｳ邏ｰ: `GET /games/:id`
    - 隧ｳ邏ｰ蜿門ｾ苓・菴薙〒縺ｯ繧ｫ繧ｦ繝ｳ繝医ｒ蠅励ｄ縺輔↑縺・
    - 隧ｳ邏ｰ逕ｻ髱｢蛛ｴ縺ｧ `POST /games/:id/view` 繧貞他縺ｳ縲∝・髢九ご繝ｼ繝縺ｮ縺ｿ `viewCount` 繧・+1 縺吶ｋ
  - 繧ｯ繝ｬ繧ｸ繝・ヨ蜿門ｾ・ `GET /games/:id/credits`
    - 隱榊庄縺ｯ蜈ｬ髢玖ｩｳ邏ｰ縺ｨ蜷梧ｧ假ｼ亥・髢九ご繝ｼ繝縺ｯ譛ｪ繝ｭ繧ｰ繧､繝ｳ蜿ｯ縲・撼蜈ｬ髢九ご繝ｼ繝縺ｯ owner 縺ｮ縺ｿ・・
    - 髱槫ｭ伜惠 / `deletedAt != null` / 讓ｩ髯舌↑縺励・ `NotFoundException('game not found')`
    - `GameAssetReference` / `GameCredit` 繝・・繝悶Ν縺ｯ譛ｪ蟆主・縺ｮ縺溘ａ縲～GameProject` / `GameScene` / `GameNode` 蜿ら・縺九ｉ蜍慕噪髮・ｨ・
    - 髮・ｨ亥ｯｾ雎｡
      - assets: `coverAssetId`, `bgAssetId`, `musicAssetId`, `sfxAssetId`, `portraitAssetId`
      - characters: `speakerCharacterId`, `portraits[*].characterId`, `portraits[*].imageId`・・CharacterImage.id` 縺九ｉ騾・ｼ輔″・・
    - 蜷御ｸID縺ｯ繧ｯ繝ｬ繧ｸ繝・ヨ荳翫〒1莉ｶ縺ｫ髮・ｴ・＠縲～usageCount` 縺ｨ `fields[*].count` 繧定ｿ泌唆
    - 蜈ｬ髢玖ｩｳ邏ｰ繝壹・繧ｸ縺ｧ縺ｯ縲御ｽｿ逕ｨ邏譚舌・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縲肴ｬ・→縺励※陦ｨ遉ｺ
    - 蜑企勁貂医∩/髱槫・髢・荳肴・縺ｮ邏譚舌・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｯ隧ｳ邏ｰ繧貞・縺励☆縺弱↑縺・ｼ医ヵ繧ｩ繝ｼ繝ｫ繝舌ャ繧ｯ蜷阪〒陦ｨ遉ｺ縲～linkable: false`・・
    - `ownerId` 陦ｨ遉ｺ縺ｯ證ｫ螳夲ｼ・by ${ownerId}`・峨ょｰ・擂縺ｯ繝励Ο繝輔ぅ繝ｼ繝ｫ陦ｨ遉ｺ蜷・繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ蜷阪∈蟾ｮ縺玲崛縺井ｺ亥ｮ・
  - 蜈ｬ髢九・繝ｬ繧､髢句ｧ九き繧ｦ繝ｳ繝・ `POST /games/:id/play`
    - 繝励Ξ繧､逕ｻ髱｢縺ｮ蛻晄悄陦ｨ遉ｺ縺ｧ蜻ｼ縺ｳ縲∝・髢九ご繝ｼ繝縺ｮ縺ｿ `playCount` 繧・+1 縺吶ｋ
    - 繧ｻ繝ｼ繝・繝ｭ繝ｼ繝峨√ヮ繝ｼ繝蛾ｲ陦後〒縺ｯ蠅励ｄ縺輔↑縺・
    - 蜃ｺ蜈ｸ: `apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`
  - 閾ｪ菴應ｸ隕ｧ・育ｮ｡逅・ｼ・ `GET /games/my`
    - 繧ｯ繧ｨ繝ｪ: `q`, `sort`, `status`
    - `q`: 遨ｺ逋ｽtrim蠕後↓遨ｺ縺ｧ縺ｪ縺代ｌ縺ｰ `title` / `summary` 縺ｮ驛ｨ蛻・ｸ閾ｴ讀懃ｴ｢・亥､ｧ譁・ｭ怜ｰ乗枚蟄鈴撼蛹ｺ蛻･・・
    - `sort`: `updated`・・updatedAt desc`・・ `created`・・createdAt desc`・・ `title`・・title asc`, `updatedAt desc`・・ `public`・・isPublic desc`, `updatedAt desc`・・
    - `status`: `all`・域欠螳壹↑縺暦ｼ・ `public`・亥・髢倶ｸｭ縺ｮ縺ｿ・・ `private`・磯撼蜈ｬ髢九・縺ｿ・・
    - 荳肴ｭ｣縺ｪ `sort` / `status` 縺ｯ `updated` / `all` 縺ｨ縺励※謇ｱ縺・
    - 繝ｭ繧ｰ繧､繝ｳ荳ｭ繝ｦ繝ｼ繧ｶ繝ｼ閾ｪ霄ｫ縺ｮ繧ｲ繝ｼ繝縺ｮ縺ｿ霑泌唆縺励～deletedAt = null` 繧堤ｶｭ謖・
  - 譖ｴ譁ｰ: `PATCH /games/:id`
    - owner 譛ｬ莠ｺ縺ｮ縺ｿ譖ｴ譁ｰ蜿ｯ閭ｽ縲∝炎髯､貂医∩繧ｲ繝ｼ繝縺ｯ譖ｴ譁ｰ荳榊庄・域里蟄倅ｻ墓ｧ假ｼ・
    - `coverAssetId` 縺ｯ `string | null` 繧貞女縺台ｻ倥￠縲～null` 縺ｧ隗｣髯､蜿ｯ閭ｽ
    - `coverAssetId` 謖・ｮ壽凾縺ｯ莉･荳九ｒ貅縺溘☆蠢・ｦ√′縺ゅｋ
      - 逕ｻ蜒上い繧ｻ繝・ヨ・・contentType` 縺・`image/` 縺ｧ髢句ｧ具ｼ・
      - 蜑企勁貂医∩縺ｧ縺ｪ縺・ｼ・deletedAt = null`・・
      - 谺｡縺ｮ縺・★繧後°繧呈ｺ縺溘☆
        - 閾ｪ蛻・・繧｢繧ｻ繝・ヨ・・ownerId === userId`・・
        - 繝ｭ繧ｰ繧､繝ｳ荳ｭ繝ｦ繝ｼ繧ｶ繝ｼ縺後♀豌励↓蜈･繧頑ｸ医∩・・Favorite(userId, assetId)` 縺悟ｭ伜惠・・
      - 讓ｩ髯舌・縺ｪ縺・ｻ紋ｺｺ繧｢繧ｻ繝・ヨ・域悴縺頑ｰ励↓蜈･繧奇ｼ峨・ `403` 縺ｧ諡貞凄
    - `isPublic: true` 繧貞性繧譖ｴ譁ｰ譎ゅ・縺ｿ蜈ｬ髢句燕繝√ぉ繝・け繧貞ｮ溯｡後＠縲～coverAssetId` 蜊倡峡譖ｴ譁ｰ縺ｧ縺ｯ蜈ｬ髢句燕繝√ぉ繝・け繧貞・螳溯｡後＠縺ｪ縺・

## 縺頑ｰ励↓蜈･繧奇ｼ・avorites・臥ｵｱ荳莉墓ｧ・

- 讌ｽ隕ｳ逧・峩譁ｰ 竊・API 蜿肴丐 竊・螟ｱ謨玲凾繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ
  - 蜃ｺ蜈ｸ: 繧｢繧ｻ繝・ヨ `apps/frontend/composables/useFavoriteToggle.ts`縲√く繝｣繝ｩ `apps/frontend/composables/useFavoriteToggleCharacter.ts`
- 陦ｨ遉ｺ蜷梧悄
  - 荳隕ｧ繝輔ぉ繝・メ蠕後↓ `applyFavorites()` 縺ｧ `isFavorited` 繧剃ｸ頑嶌縺・
  - 蜃ｺ蜈ｸ: `apps/frontend/composables/useAssets.ts#applyFavorites`
- 霑泌唆繝・・繧ｿ縺ｮ陦ｨ險倥ｆ繧後ｒ豁｣隕丞喧
  - `normalizeAssetFavorite()` 縺ｧ `isFavorited` 繧剃ｻ倅ｸ趣ｼ・isFavorite`/`favorited` 遲峨ｒ蜷ｸ蜿趣ｼ・
  - 蜃ｺ蜈ｸ: `apps/frontend/composables/useAssets.ts#normalizeAssetFavorite`

## 繧｢繧ｻ繝・ヨ縺頑ｰ励↓蜈･繧頑焚陦ｨ遉ｺMVP・・026-05-03・・

- 螳溯｣・ｯ・峇
  - 蜈ｬ髢九い繧ｻ繝・ヨ荳隕ｧ `GET /search/assets` 縺ｮ `items[*]` 縺ｫ `favoriteCount` 繧定ｿｽ蜉
  - 繧｢繧ｻ繝・ヨ隧ｳ邏ｰ `GET /assets/:id` 縺ｫ `favoriteCount` 繧定ｿｽ蜉
  - 蜈ｬ髢倶ｸ隕ｧ繧ｫ繝ｼ繝・`/assets` 縺ｧ `縺頑ｰ励↓蜈･繧・n` 繧定｡ｨ遉ｺ・・undefined` 縺ｯ `0` 謇ｱ縺・ｼ・
  - 繧｢繧ｻ繝・ヨ隧ｳ邏ｰ `/assets/:id` 縺ｧ `縺頑ｰ励↓蜈･繧・n` 繧定｡ｨ遉ｺ縺励√ヨ繧ｰ繝ｫUI縺ｮ霑大ｍ縺ｫ驟咲ｽｮ
- API螳溯｣・婿驥・
  - Prisma relation 縺ｮ `_count`・・_count.favorites`・峨ｒ蛻ｩ逕ｨ
  - `favoriteCount` 蟆ら畑繧ｫ繝ｩ繝縺ｯ霑ｽ蜉縺励↑縺・ｼ・igration 縺ｪ縺暦ｼ・
  - 蜑企勁貂医∩繧｢繧ｻ繝・ヨ縺ｯ譌｢蟄俶婿驥昴←縺翫ｊ `deletedAt: null` 縺ｮ縺ｿ霑泌唆
- 縺頑ｰ励↓蜈･繧願ｿｽ蜉/隗｣髯､譎ゅ・譖ｴ譁ｰ譁ｹ蠑・
  - 讌ｽ隕ｳ譖ｴ譁ｰ縺ｧ `isFavorite/isFavorited` 縺ｨ `favoriteCount` 繧貞酔譎よ峩譁ｰ
  - 霑ｽ蜉謌仙粥: `+1`縲∬ｧ｣髯､謌仙粥: `-1`・井ｸ矩剞 `0`・・
  - API螟ｱ謨玲凾縺ｯ favorite 迥ｶ諷九→莉ｶ謨ｰ繧偵Ο繝ｼ繝ｫ繝舌ャ繧ｯ
- 蠖ｱ髻ｿ遽・峇繝｡繝｢
  - `/my/favorites` 繧ょ酔縺倥い繧ｻ繝・ヨ繧ｫ繝ｼ繝芽｡ｨ遉ｺ譎ゅ↓ `favoriteCount` 繧定・辟ｶ陦ｨ遉ｺ・亥叙蠕励〒縺阪ｋ蝣ｴ蜷茨ｼ・
  - `/my/assets` 縺ｯ邂｡逅・判髱｢縺ｮ縺溘ａ陦ｨ遉ｺ蠢・亥ｯｾ雎｡螟厄ｼ域里蟄篭I繧堤ｶｭ謖・ｼ・

## 縺・＞縺ｭ / 邏譚先｣・/ 謗｡逕ｨ / 蠑慕畑繝ｻ繧ｯ繝ｬ繧ｸ繝・ヨ 窶・讎ょｿｵ謨ｴ逅・ｼ郁ｨｭ險域婿驥晢ｼ・

### 迴ｾ迥ｶ・・VP・・

迴ｾ蝨ｨ `favorites` 繝・・繝悶Ν縺御ｻ･荳九・2縺､縺ｮ蠖ｹ蜑ｲ繧貞・縺ｭ縺ｦ縺・ｋ縲・

1. **縺頑ｰ励↓蜈･繧・/ 縺・＞縺ｭ** 窶・螂ｽ縺阪・蠢懈抄繝ｻ縺ゅ→縺ｧ隕九ｋ繝ｻ莠ｺ豌玲欠讓・
2. **邏譚先｣・/ 蛻ｶ菴懈｣・* 窶・閾ｪ蛻・・繧ｲ繝ｼ繝蛻ｶ菴懊〒菴ｿ縺・ｴ譚舌ｒ髮・ａ繧句宛菴懃畑繝悶ャ繧ｯ繝槭・繧ｯ

MVP縺ｨ縺励※縺薙・蜈ｼ莉ｻ繧定ｨｱ螳ｹ縺吶ｋ縲ゅ◆縺縺怜ｰ・擂逧・↓縺ｯ莉･荳九・縺ｨ縺翫ｊ讎ょｿｵ蛻・屬繧呈､懆ｨ弱☆繧九・

迴ｾ迥ｶ縺ｮ Picker 縺ｨ縺ｮ髢｢菫・
- `AssetPicker` 縺ｯ縲瑚・蛻・・繧｢繧ｻ繝・ヨ / 縺頑ｰ励↓蜈･繧翫阪・2繧ｿ繝匁ｧ区・縺ｧ縲√♀豌励↓蜈･繧頑ｸ医∩繧｢繧ｻ繝・ヨ繧貞宛菴懃ｴ譚仙呵｣懊→縺励※謇ｱ縺｣縺ｦ縺・ｋ縲・
- `CharacterPicker` 繧ゅ瑚・蛻・・繧ｭ繝｣繝ｩ / 縺頑ｰ励↓蜈･繧翫阪・2繧ｿ繝匁ｧ区・縺ｧ縲∝酔讒倥↓縺頑ｰ励↓蜈･繧頑ｸ医∩繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ繧貞宛菴懷呵｣懊→縺励※謇ｱ縺｣縺ｦ縺・ｋ縲・
- 縺､縺ｾ繧顔樟陦後・縺頑ｰ励↓蜈･繧翫・縲∝ｮ溯ｳｪ逧・↓蛻ｶ菴懃ｴ譚先｣壹・蠖ｹ蜑ｲ繧よ戟縺｣縺ｦ縺・ｋ縲・

### 蟆・擂蛻・￠繧・讎ょｿｵ

#### 1. 縺・＞縺ｭ / Like

| 鬆・岼 | 蜀・ｮｹ |
|------|------|
| 諢丞袖 | 邏皮ｲ九↑螂ｽ諢上・蠢懈抄繝ｻ隧穂ｾ｡縲ゅ後≠縺ｨ縺ｧ蛻ｶ菴懊↓菴ｿ縺・阪→縺ｯ蛻・￠繧・|
| 逕ｨ騾・| 繧｢繧ｻ繝・ヨ/繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｸ縺ｮ蜿榊ｿ懊√Λ繝ｳ繧ｭ繝ｳ繧ｰ縲∽ｽ懆・∈縺ｮ繝輔ぅ繝ｼ繝峨ヰ繝・け縲√♀縺吶☆繧・莠ｺ豌鈴・|
| UI譁・ｨ蛟呵｣・| `縺・＞縺ｭ` / `蠢懈抄` / `螂ｽ縺港 |
| 蟆・擂DB蛟呵｣・| `AssetLike`縲～CharacterLike`縲√∪縺溘・豎守畑 `likes` |
| 豕ｨ諢・| 迴ｾ蝨ｨ縺ｮ `Favorite` 縺ｨ豺ｷ蜷後＠縺ｪ縺・ょｰ・擂逧・↓ `favoriteCount` 縺ｯ `likeCount` 逶ｸ蠖薙↓蟇・○繧九°縲∽ｺ呈鋤蜷阪→縺励※謇ｱ縺・°繧呈､懆ｨ主ｯｾ雎｡縺ｫ縺吶ｋ |

#### 2. 邏譚先｣・/ Shelf / Library

| 鬆・岼 | 蜀・ｮｹ |
|------|------|
| 諢丞袖 | 繧ｲ繝ｼ繝蛻ｶ菴懊〒菴ｿ縺・◆繧√↓縲∬・蛻・・蛻ｶ菴懈｣壹∈菫晏ｭ倥☆繧九％縺ｨ縲１icker縺ｫ陦ｨ遉ｺ縺輔ｌ繧句呵｣懊ょ･ｽ縺阪°縺ｩ縺・°縺ｧ縺ｯ縺ｪ縺上悟宛菴懊↓菴ｿ縺・°繧ゅ＠繧後↑縺・咲憾諷・|
| 逕ｨ騾・| 閭梧勹/BGM/SE/繧ｫ繝舌・逕ｻ蜒上・驕ｸ謚槫呵｣懊√く繝｣繝ｩ繧ｯ繧ｿ繝ｼ驟咲ｽｮ蛟呵｣懊∝宛菴懃畑繝悶ャ繧ｯ繝槭・繧ｯ |
| UI譁・ｨ蛟呵｣・| `邏譚先｣壹↓霑ｽ蜉` / `蛻ｶ菴懈｣壹↓霑ｽ蜉` / `蛻ｶ菴懊↓霑ｽ蜉` / `繝ｩ繧､繝悶Λ繝ｪ縺ｫ霑ｽ蜉` |
| 蟆・擂DB蛟呵｣・| `AssetShelfItem`縲～CharacterShelfItem`縲√∪縺溘・ `asset_shelf_items` / `character_shelf_items` |
| 豕ｨ諢・| 迴ｾ迥ｶ縺ｮ `Favorite` 縺ｯ縺薙％繧ょ・莉ｻ縲らｧｻ陦梧凾縺ｯ譌｢蟄・`favorites` 繧呈｣壹↓蛻晄悄遘ｻ陦後☆繧九°縲√＞縺・・縺ｫ蛻晄悄遘ｻ陦後☆繧九°縲√Θ繝ｼ繧ｶ繝ｼ縺ｫ驕ｸ縺ｰ縺帙ｋ縺九ｒ蟆・擂讀懆ｨ弱ょ宛菴懃畑Picker縺ｯ蜴溷援縲瑚・蛻・・邏譚・+ 邏譚先｣壹阪ｒ陦ｨ遉ｺ縺吶ｋ譁ｹ蜷・|

#### 3. 謗｡逕ｨ / Use / Adoption

| 鬆・岼 | 蜀・ｮｹ |
|------|------|
| 諢丞袖 | 繧ｲ繝ｼ繝蜀・〒螳滄圀縺ｫ蜿ら・縺輔ｌ縺ｦ縺・ｋ迥ｶ諷九りレ譎ｯ/BGM/SE/繧ｫ繝舌・逕ｻ蜒・遶九■邨ｵ莠呈鋤縺ｪ縺ｩ縲√ご繝ｼ繝繝・・繧ｿ縺ｫ菫晏ｭ倥＆繧後※縺・ｋ蜿ら・縲ゆｽ懆・↓霑斐ｋ螳溽ｸｾ縺ｨ縺励※驥崎ｦ・|
| 逕ｨ騾・| 菴ｿ逕ｨ謨ｰ/謗｡逕ｨ謨ｰ髮・ｨ医√い繧ｻ繝・ヨ菴懆・∈縺ｮ蛻ｩ逕ｨ螳溽ｸｾ陦ｨ遉ｺ縲∝炎髯､蠖ｱ髻ｿ陦ｨ遉ｺ縺ｨ縺ｮ騾｣謳ｺ |
| 菫晄戟縺励◆縺・ュ蝣ｱ萓・| `gameId`縲～assetId` or `characterId`縲～field`・・overAssetId / bgAssetId / musicAssetId / sfxAssetId / portraitAssetId / speakerCharacterId / portraits 遲会ｼ峨～sceneId?`縲～nodeId?`縲～createdAt`縲～updatedAt` |
| 蟆・擂DB蛟呵｣・| `GameAssetReference`縲～GameCharacterReference`縲～AssetUsage`縲～CharacterUsage` |
| 豕ｨ諢・| 謗｡逕ｨ縺ｯ縲梧｣壹↓蜈･縺｣縺ｦ縺・ｋ縲阪□縺代〒縺ｯ逋ｺ逕溘＠縺ｪ縺・ゆｿ晏ｭ俶凾/蜈ｬ髢句燕繝√ぉ繝・け/蜿ら・險ｺ譁ｭ/蜑企勁蠖ｱ髻ｿ陦ｨ遉ｺ縺ｨ騾｣謳ｺ縺吶ｋ縲る撼蜈ｬ髢九ご繝ｼ繝縺ｮ謗｡逕ｨ諠・ｱ縺ｯ縲∽ｽ懆・↓隧ｳ邏ｰ繧定ｿ斐＆縺ｪ縺・ｼ磯寔險医□縺代√∪縺溘・閾ｪ蛻・・繧ｲ繝ｼ繝縺縺題ｩｳ邏ｰ陦ｨ遉ｺ・・|

#### 4. 蠑慕畑繝ｻ繧ｯ繝ｬ繧ｸ繝・ヨ / Credit

| 鬆・岼 | 蜀・ｮｹ |
|------|------|
| 諢丞袖 | 蜈ｬ髢九ご繝ｼ繝繧・せ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ縺ｧ縲∫ｴ譚蝉ｽ懆・・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ菴懆・ｒ陦ｨ遉ｺ縺吶ｋ縺溘ａ縺ｮ髢｢菫ゅゅ梧治逕ｨ縲阪→霑代＞縺後∬ｦ九○譁ｹ繝ｻ讓ｩ蛻ｩ繝ｻ菴懆・ｰ企㍾縺ｮ譁・ц |
| 逕ｨ騾・| 繧ｲ繝ｼ繝繝壹・繧ｸ縺ｧ縺ｮ邏譚舌け繝ｬ繧ｸ繝・ヨ陦ｨ遉ｺ縲√せ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ縲∽ｽ懆・∈縺ｮ蟶ｰ螻樊・遉ｺ |
| UI譁・ｨ蛟呵｣・| `菴ｿ逕ｨ邏譚秦 / `邏譚舌け繝ｬ繧ｸ繝・ヨ` / `縺薙・繧ｲ繝ｼ繝縺ｧ菴ｿ繧上ｌ縺ｦ縺・ｋ邏譚秦 / `繧ｯ繝ｬ繧ｸ繝・ヨ縺ｫ陦ｨ遉ｺ` |
| 蟆・擂DB蛟呵｣・| `GameCredit`縲～GameAssetCredit`縲～GameCharacterCredit`縲√∪縺溘・ `GameAssetReference` 縺九ｉ閾ｪ蜍慕函謌・|
| 豕ｨ諢・| MVP縺ｧ縺ｯ閾ｪ蜍慕函謌先婿驥昴〒繧医＞縲よ焔蜍慕ｷｨ髮・・莉ｻ諢剰ｿｽ險倥・蟆・擂隱ｲ鬘後ょ炎髯､貂医∩/髱槫・髢狗ｴ譚舌・陦ｨ遉ｺ蜷阪ｒ縺ｩ縺・ｮ九☆縺九・蟆・擂隱ｲ鬘後り｡ｨ遉ｺ蜷阪・菴懆・錐縺ｮ繧ｹ繝翫ャ繝励す繝ｧ繝・ヨ菫晏ｭ倥′蠢・ｦ√↓縺ｪ繧句庄閭ｽ諤ｧ縺後≠繧・|

## 繧ｯ繝ｬ繧ｸ繝・ヨ陦ｨ遉ｺMVP・・026-05-05・・

- 迴ｾ蝨ｨ縺ｯ `GameAssetReference` / `GameCharacterReference` / `GameCredit` 繝・・繝悶Ν繧定ｿｽ蜉縺帙★縲∽ｿ晏ｭ俶ｸ医∩縺ｮ `GameProject` / `GameNode` 蜿ら・繧・API 蛛ｴ縺ｧ蜍慕噪髮・ｨ医☆繧九・
- 蜈ｬ髢九ご繝ｼ繝隧ｳ邏ｰ繝壹・繧ｸ `/games/:id` 縺ｫ縲御ｽｿ逕ｨ邏譚舌・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縲肴ｬ・ｒ陦ｨ遉ｺ縺吶ｋ縲・
- 陦ｨ遉ｺ蟇ｾ雎｡
  - assets: `coverAssetId`, `bgAssetId`, `musicAssetId`, `sfxAssetId`, `portraitAssetId`
  - characters: `speakerCharacterId`, `portraits`
- 蜑企勁貂医∩/髱槫・髢・荳肴・縺ｮ邏譚舌・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｯ隧ｳ邏ｰ諠・ｱ繧貞・縺励☆縺弱★縲√ヵ繧ｩ繝ｼ繝ｫ繝舌ャ繧ｯ蜷阪→髱槭Μ繝ｳ繧ｯ陦ｨ遉ｺ縺ｫ縺吶ｋ縲・
- `ownerId` 縺ｮ `by ...` 陦ｨ遉ｺ縺ｯ證ｫ螳夐°逕ｨ縲ょｰ・擂縺ｯ繝励Ο繝輔ぅ繝ｼ繝ｫ陦ｨ遉ｺ蜷・繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ蜷阪∈蟾ｮ縺玲崛縺医ｋ縲・

#### 繧ｯ繝ｬ繧ｸ繝・ヨ谺ФI polish・・026-05-05・・

- `ownerId` UUID 縺ｮ荳ｸ蜃ｺ縺苓｡ｨ遉ｺ繧偵ｄ繧√～by d7ef...f292` 縺ｮ繧医≧縺ｫ蜈磯ｭ4譁・ｭ暦ｼ区忰蟆ｾ4譁・ｭ励↓遏ｭ邵ｮ陦ｨ遉ｺ縺吶ｋ縲・
- 邏譚仙錐/繧ｭ繝｣繝ｩ蜷阪ｒ1陦檎岼縺ｫ蜃ｺ縺励∽ｽ懆・｡ｨ遉ｺ縺ｨ逕ｨ騾斐ヰ繝・ず繧・陦檎岼縺ｫ蟆上＆繧∬｡ｨ遉ｺ縺吶ｋ縲・
- 逕ｨ騾費ｼ・閭梧勹 4邂・園` / `BGM 2邂・園` 縺ｪ縺ｩ・峨・譁・ｭ怜・騾｣邨舌°繧牙ｰ上＆縺ｪ badge/pill 陦ｨ遉ｺ縺ｫ螟画峩縲・
- `linkable === false`・亥炎髯､貂医∩/髱槫・髢・荳肴・・峨・鬆・岼縺ｯ蜷榊燕繧呈而縺医ａ濶ｲ縺ｫ縺励∽ｽ懆・｡後ｒ縲瑚ｩｳ邏ｰ髱槫・髢九阪→陦ｨ遉ｺ縺吶ｋ縲・
- API / DB / Prisma schema 縺ｯ螟画峩縺励↑縺・り｡ｨ遉ｺUI縺ｮ縺ｿ縺ｮ謾ｹ蝟・・
- 蟆・擂逧・↓縺ｯ繝励Ο繝輔ぅ繝ｼ繝ｫ/繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ陦ｨ遉ｺ蜷阪∈蟾ｮ縺玲崛縺医ｋ譁ｹ驥昴・邯ｭ謖√・

蟆・擂隱ｲ鬘・
- `GameAssetReference` / `GameCharacterReference` 蟆主・
- `GameCredit` 蟆主・
- 繧ｯ繝ｬ繧ｸ繝・ヨ縺ｮ繧ｹ繝翫ャ繝励す繝ｧ繝・ヨ菫晏ｭ・
- 謇句虚霑ｽ險・繧ｹ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ
- 繝ｩ繧､繧ｻ繝ｳ繧ｹ/蛻ｩ逕ｨ譚｡莉ｶ陦ｨ遉ｺ

#### 繧ｯ繝ｬ繧ｸ繝・ヨ菴懆・｡ｨ遉ｺ縺ｮ蟆・擂謾ｹ蝟・

- 迴ｾ迥ｶ:
  - `ownerId` 繧・`by <ownerId>` 縺ｨ縺励※證ｫ螳夊｡ｨ遉ｺ縺励※縺・◆縺後・026-05-05 UI polish 縺ｫ縺ｦ `by d7ef...f292` 蠖｢蠑上↓遏ｭ邵ｮ貂医∩縲・
  - 逕ｨ騾斐ヰ繝・ず蛹悶・陦瑚｡ｨ遉ｺ謾ｹ蝟・ｂ蜷梧凾縺ｫ螳滓命貂医∩縲・
- 蟆・擂譯・
  - 繝ｦ繝ｼ繧ｶ繝ｼ繝励Ο繝輔ぅ繝ｼ繝ｫ/繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ陦ｨ遉ｺ蜷阪ｒ蟆主・縺励～by <displayName>` 縺ｫ蟾ｮ縺玲崛縺医ｋ
  - 繝励Ο繝輔ぅ繝ｼ繝ｫ譛ｪ險ｭ螳壽凾縺ｯ遏ｭ邵ｮUUID・育樟陦後・陦ｨ遉ｺ・峨↓繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縺吶ｋ
  - 繝ｪ繝ｳ繧ｯ蜿ｯ閭ｽ縺ｪ繧我ｽ懆・・繝ｭ繝輔ぅ繝ｼ繝ｫ繝壹・繧ｸ縺ｸ繝ｪ繝ｳ繧ｯ縺吶ｋ
  - 蜑企勁貂医∩/騾莨壽ｸ医∩/髱槫・髢九Θ繝ｼ繧ｶ繝ｼ縺ｮ蝣ｴ蜷医・繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ陦ｨ遉ｺ繧呈ｱｺ繧√ｋ
- 繝励Ο繝輔ぅ繝ｼ繝ｫ/繧ｯ繝ｪ繧ｨ繧､繧ｿ繝ｼ蜷阪・螳溯｣・・蟆・擂谿ｵ髫弱〒陦後≧

### 豁｣隕乗治逕ｨ繝ｫ繝ｼ繝茨ｼ・X險ｭ險域婿驥晢ｼ・

邏譚舌・繧ｳ繝斐・縺励※螂ｪ縺・ｂ縺ｮ縺ｧ縺ｯ縺ｪ縺上√ご繝ｼ繝菴懷刀蜀・〒豁｣蠑上↓謗｡逕ｨ縺励∽ｽ懆・↓螳溽ｸｾ縺ｨ繧ｯ繝ｬ繧ｸ繝・ヨ縺瑚ｿ斐ｋ繧ゅ・縺ｨ縺励※險ｭ險医☆繧九・

**豁｣隕上ヵ繝ｭ繝ｼ:**
1. 繧ｮ繝｣繝ｩ繝ｪ繝ｼ縺ｧ邏譚舌・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ繧定ｦ九ｋ
2. 縺・＞縺ｭ縺吶ｋ縲√∪縺溘・邏譚先｣壹↓霑ｽ蜉縺吶ｋ
3. 繧ｨ繝・ぅ繧ｿ縺ｮ Picker 縺九ｉ邏譚先｣壹・邏譚舌ｒ驕ｸ縺ｶ
4. 繝弱・繝・繧ｲ繝ｼ繝菫晏ｭ俶凾縺ｫ謗｡逕ｨ髢｢菫ゅ′險倬鹸縺輔ｌ繧・
5. 蜈ｬ髢九ご繝ｼ繝縺ｮ隧ｳ邏ｰ/繧ｯ繝ｬ繧ｸ繝・ヨ縺ｫ邏譚蝉ｽ懆・′陦ｨ遉ｺ縺輔ｌ繧・
6. 邏譚蝉ｽ懆・・縺ｫ縺ｯ謗｡逕ｨ謨ｰ/菴ｿ逕ｨ謨ｰ縺ｨ縺励※螳溽ｸｾ縺瑚ｿ斐ｋ

縺薙・譁ｹ驥昴ｒ雋ｫ縺上％縺ｨ縺ｧ縲∝・繧｢繝・・繝ｭ繝ｼ繝峨ｄ繧ｳ繝斐・繧医ｊ豁｣隕上Ν繝ｼ繝医′萓ｿ蛻ｩ縺ｧ蠕励↓縺ｪ繧倶ｽ馴ｨ薙ｒ菴懊ｋ縺薙→縺檎岼讓吶・

### 蟆・擂縺ｮ謖・ｨ吝・髮｢譯・

| 謖・ｨ・| 諢丞袖 |
|------|------|
| 縺・＞縺ｭ謨ｰ | 莠ｺ豌・隧穂ｾ｡ |
| 邏譚先｣夊ｿｽ蜉謨ｰ | 蛻ｶ菴懆・′菴ｿ縺・◆縺・→諤昴▲縺滓焚 |
| 謗｡逕ｨ謨ｰ / 菴ｿ逕ｨ謨ｰ | 螳滄圀縺ｫ繧ｲ繝ｼ繝蜀・〒菴ｿ繧上ｌ縺滓焚・亥・髢九ご繝ｼ繝縺ｮ縺ｿ or 蜈ｨ繧ｲ繝ｼ繝縺九・隕∵､懆ｨ趣ｼ・|
| 髢ｲ隕ｧ謨ｰ | 隕九ｉ繧後◆謨ｰ |

### 蟆・擂縺ｮUI譁・ｨ譯・

| 謫堺ｽ・| 諢丞袖 |
|------|------|
| 縺・＞縺ｭ | 螂ｽ縺・蠢懈抄/縺ゅ→縺ｧ隕九ｋ |
| 邏譚先｣壹↓霑ｽ蜉 | 蛻ｶ菴懊↓菴ｿ縺・呵｣懊→縺励※菫晏ｭ・|
| 縺薙・繧ｲ繝ｼ繝縺ｧ謗｡逕ｨ縺励※縺・ｋ邏譚・| 螳滄圀縺ｫ繧ｲ繝ｼ繝蜀・〒蜿ら・縺励※縺・ｋ邏譚・|
| 邏譚舌け繝ｬ繧ｸ繝・ヨ | 繧ｹ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ/邏譚舌け繝ｬ繧ｸ繝・ヨ蟇ｾ雎｡ |
| 繧ｯ繝ｬ繧ｸ繝・ヨ縺ｫ陦ｨ遉ｺ | 菴懆・錐繝ｻ邏譚仙錐繧偵ご繝ｼ繝繝壹・繧ｸ縺ｫ謗ｲ霈・|

## 繧｢繧ｻ繝・ヨ謖・ｨ吶・蟆・擂隱ｲ鬘・

- 繧｢繧ｻ繝・ヨ髢ｲ隕ｧ謨ｰ `viewCount`
  - 髮・ｨ亥ｯｾ雎｡: `/assets/:id` 隧ｳ邏ｰ陦ｨ遉ｺ
  - 髱槫ｯｾ雎｡: `/assets` 荳隕ｧ陦ｨ遉ｺ縲～/my/assets` 邂｡逅・判髱｢
  - MVP譯・ 繧ｲ繝ｼ繝縺ｨ蜷梧ｧ倥↓繝ｪ繝ｭ繝ｼ繝峨＃縺ｨ蠅怜刈繧定ｨｱ螳ｹ
  - 蟆・擂: 繝ｦ繝九・繧ｯ髢ｲ隕ｧ・医Θ繝ｼ繧ｶ繝ｼ/IP驥崎､・勁螟厄ｼ・
- 繧｢繧ｻ繝・ヨ縺頑ｰ励↓蜈･繧頑焚縺ｮ鬮伜ｺｦ蛹・
  - 荳隕ｧ雋闕ｷ谺｡隨ｬ縺ｧ `favoriteCount` 繧ｫ繝ｩ繝縺ｮ蟆主・繧呈､懆ｨ・
  - favorite/unfavorite 譎ゅ↓繧ｫ繧ｦ繝ｳ繧ｿ蠅玲ｸ・
  - 縺頑ｰ励↓蜈･繧企・た繝ｼ繝医∽ｺｺ豌鈴・た繝ｼ繝医∈縺ｮ豢ｻ逕ｨ
- 繧｢繧ｻ繝・ヨ菴ｿ逕ｨ謨ｰ `usedInGameCount`
  - 閭梧勹/BGM/SE/繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ邏譚仙挨縺ｮ髮・ｨ・
  - 蜈ｬ髢九ご繝ｼ繝縺ｮ縺ｿ蟇ｾ雎｡縺九・撼蜈ｬ髢九ご繝ｼ繝繧貞性繧√ｋ縺九ｒ讀懆ｨ・
  - 繧ｲ繝ｼ繝蜑企勁/髱槫・髢句喧譎ゅ・髮・ｨ医Ν繝ｼ繝ｫ繧呈紛逅・
  - 菴ｿ逕ｨ謨ｰ鬆・た繝ｼ繝医∈縺ｮ豢ｻ逕ｨ
- 繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/讀懃ｴ｢騾｣謳ｺ
  - 縺頑ｰ励↓蜈･繧企・・夢隕ｧ謨ｰ鬆・∽ｽｿ逕ｨ謨ｰ鬆・∽ｺｺ豌鈴・
  - 繧ｿ繧ｰ讀懃ｴ｢縺ｨ縺ｮ隍・粋譚｡莉ｶ
  - Meilisearch / 鬮伜ｺｦ讀懃ｴ｢繧ｹ繧ｳ繧｢繝ｪ繝ｳ繧ｰ騾｣謳ｺ
- 蛻・梵蝓ｺ逶､
  - 菴懆・ム繝・す繝･繝懊・繝・
  - 繧､繝吶Φ繝医Ο繧ｰ繝・・繝悶Ν

## 讀懃ｴ｢ / 繝輔ぅ繝ｫ繧ｿ / URL 蜷梧悄

- `/assets`・亥・髢具ｼ峨→ `/my/assets`・郁・蛻・ｼ・
  - 繧ｯ繧ｨ繝ｪ: `q`, `contentType`, `primaryTag`, `tags`, `sort` 繧旦RL縺ｫ蜿肴丐繝ｻ蠕ｩ蜈・
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/assets/index.vue`, `apps/frontend/pages/my/assets/index.vue`, API縺ｯ `apps/api/src/search/search.controller.ts`
- `/characters`・亥・髢倶ｸ隕ｧ・・
  - 繧ｯ繧ｨ繝ｪ: `q`, `tags`, `sort` 繧旦RL縺ｫ蜿肴丐繝ｻ蠕ｩ蜈・
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/characters/index.vue`
- `/games`・亥・髢倶ｸ隕ｧ・・
  - 繧ｯ繧ｨ繝ｪ: `q`, `sort` 繧旦RL縺ｫ蜿肴丐繝ｻ蠕ｩ蜈・ｼ・sort` 譛ｪ謖・ｮ壽凾縺ｯ `new`・・
  - 讀懃ｴ｢蟇ｾ雎｡: `title`, `summary`・・I陦ｨ遉ｺ荳翫・ description 縺ｫ繝槭ャ繝暦ｼ・
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/games/index.vue`, `apps/frontend/composables/useGames.ts`, `apps/api/src/games/games.service.ts`
- `/my/games`・郁・菴懃ｮ｡逅・ｸ隕ｧ・・
  - 繧ｯ繧ｨ繝ｪ: `q`, `sort`, `status` 繧旦RL縺ｫ蜿肴丐繝ｻ蠕ｩ蜈・ｼ・sort` 譛ｪ謖・ｮ壽凾縺ｯ `updated`縲～status` 譛ｪ謖・ｮ壽凾縺ｯ `all`・・
  - 讀懃ｴ｢蟇ｾ雎｡: `title`, `summary`
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/my/games/index.vue`, `apps/frontend/composables/useGames.ts`, `apps/api/src/games/games.controller.ts`, `apps/api/src/games/games.service.ts`

## 繧ｵ繝繝・/ 鄂ｲ蜷攻RL 蜿匁桶

- 蜿門ｾ励ヵ繝ｭ繝ｼ: `GET /uploads/signed-get` 縺ｧ JSON `{ url }` 繧貞女縺大叙繧翫～<img src>` 縺ｫ驕ｩ逕ｨ
  - 蜃ｺ蜈ｸ: `apps/frontend/composables/useSignedUrl.ts` 縺ｨ `apps/frontend/components/character/CharacterImageThumb.vue`
- TTL蛻・ｌ譎ゅ・蜀榊叙蠕・ 403 繧呈､懃衍縺励※蜀咲ｽｲ蜷阪ｒ陦後≧繝倥Ν繝代・縺ゅｊ
  - 蜃ｺ蜈ｸ: `apps/frontend/composables/useAutoRefreshUrl.ts`
- 繧ｹ繧ｱ繝ｫ繝医Φ陦ｨ遉ｺ: URL譛ｪ蜿門ｾ玲凾縺ｯ繝励Ξ繝ｼ繧ｹ繝帙Ν繝陦ｨ遉ｺ
  - 蜃ｺ蜈ｸ: `apps/frontend/components/character/CharacterImageThumb.vue`
- 逶ｴ fetch 遖∵ｭ｢ / `$api` 邨檎罰
  - 隱崎ｨｼ繝医・繧ｯ繝ｳ莉倅ｸ弱・401譎ゅ・閾ｪ蜍輔Μ繝医Λ繧､遲峨ｒ陦後≧ `$api` 繧剃ｽｿ逕ｨ
  - 蜃ｺ蜈ｸ: `apps/frontend/plugins/api-auth.client.ts`, `apps/frontend/composables/useApi.ts`

## 譌｢遏･縺ｮ關ｽ縺ｨ縺礼ｩｴ & 蟇ｾ蜃ｦ

- 401/403
  - `$api` 邨檎罰縺ｧ Authorization 繧剃ｻ倅ｸ弱・01譎ゅ・ Supabase 縺ｮ繧ｻ繝・す繝ｧ繝ｳ譖ｴ譁ｰ竊貞・隧ｦ陦・
  - 蜃ｺ蜈ｸ: `apps/frontend/plugins/api-auth.client.ts`
- 鄂ｲ蜷攻RL TTL 蛻・ｌ
  - 403 讀懃衍縺ｧ蜀榊叙蠕暦ｼ・useAutoRefreshUrl`・峨√ｂ縺励￥縺ｯ `useSignedUrl.refresh()` 繧貞他縺ｶ
  - 蜃ｺ蜈ｸ: `apps/frontend/composables/useAutoRefreshUrl.ts`, `apps/frontend/composables/useSignedUrl.ts`
- CI `ERR_PNPM_OUTDATED_LOCKFILE`
  - `pnpm install --frozen-lockfile` 繧貞燕謠舌↓ lockfile・・pnpm-lock.yaml`・峨ｂ蠢・★繧ｳ繝溘ャ繝・

## 繝・せ繝・/ E2E TODO・域栢邊具ｼ・

- 笙｡繝医げ繝ｫ・医い繧ｻ繝・ヨ/繧ｭ繝｣繝ｩ・会ｼ壽･ｽ隕ｳ譖ｴ譁ｰ縺ｨ繝ｭ繝ｼ繝ｫ繝舌ャ繧ｯ縺ｮ遒ｺ隱・
- 鄂ｲ蜷宏ET蜀榊叙蠕暦ｼ・03蠕後・閾ｪ蜍募・蜿門ｾ・
- 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ邱ｨ髮・ｼ壻ｸｦ縺ｳ譖ｿ縺・&D縲～sortOrder` 菫晏ｭ倥∝炎髯､縺ｮ蜿悶ｊ豸医＠繝医・繧ｹ繝・
- 繧｢繝・・繝ｭ繝ｼ繝我ｸ騾｣・啀UT 鄂ｲ蜷坂・逋ｻ骭ｲ竊偵し繝繝崎｡ｨ遉ｺ

---

## 繧ｲ繝ｼ繝蛻ｶ菴懶ｼ夷ｲ・我ｻ墓ｧ・

### 逶ｮ逧・
Talking 荳翫〒"繧ｷ繝ｼ繝ｳ竊偵ヮ繝ｼ繝・縺ｮ鬆・↓繝・く繧ｹ繝・貍泌・繧堤ｵ・∩遶九※縲√・繝ｬ繝薙Η繝ｼ縺励↑縺後ｉ ADV 鬚ｨ繧ｲ繝ｼ繝繧貞宛菴懊〒縺阪ｋ縲・

### 繧ｲ繝ｼ繝蜿ら・險ｺ譁ｭ・・eference Diagnostics・窺VP莉墓ｧ假ｼ・026-05-04・・

#### 讎りｦ・
- 菫晏ｭ俶ｸ医∩繧ｲ繝ｼ繝・・ameProject・牙・縺ｮ蜈ｨ繝弱・繝峨ｒ襍ｰ譟ｻ縺励・*邏譚舌・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ繝ｻ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ逕ｻ蜒上・蜿ら・繧ｨ繝ｩ繝ｼ**繧定ｨｺ譁ｭ縺吶ｋ縲・
- API蛛ｴ縺ｧ荳諡ｬ繝√ぉ繝・け縺励√お繝・ぅ繧ｿ逕ｻ髱｢縺ｮ繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け谺・↓隴ｦ蜻翫→縺励※陦ｨ遉ｺ縲・
- 險ｺ譁ｭ縺ｯ閾ｪ蜍募ｮ溯｡後〒縲∽ｿ晏ｭ伜・逅・ｒ繝悶Ο繝・け縺励↑縺・ｼ郁ｭｦ蜻願｡ｨ遉ｺ縺ｮ縺ｿ・峨・
- 蜑企勁繝ｻ髱槫・髢九・蝙倶ｸ堺ｸ閾ｴ縺ｪ縺ｩ**蜿ら・繧ｨ繝ｩ繝ｼ縺ｮ蛻､螳・*繧堤ｴｰ蛻・喧縺励√Θ繝ｼ繧ｶ繝ｼ縺悟撫鬘後ｒ謚頑升縺励ｄ縺吶￥縺吶ｋ縲・

#### 險ｺ譁ｭ蟇ｾ雎｡縺ｨ隴ｦ蜻翫さ繝ｼ繝・
險ｺ譁ｭ縺ｯ繧ｲ繝ｼ繝蜈ｨ菴薙∪縺溘・繧ｷ繝ｼ繝ｳ/繝弱・繝牙腰菴阪〒螳溯｡後〒縺阪∝推蝠城｡後↓蝗ｺ譛峨・隴ｦ蜻翫さ繝ｼ繝会ｼ・ode・峨ｒ蜑ｲ繧雁ｽ薙※繧九・

| 繧ｳ繝ｼ繝・| 蟇ｾ雎｡ | 蜴溷屏 | 隱ｬ譏・|
|--------|------|------|------|
| `ASSET_MISSING` | 閭梧勹/BGM/SE | 蟄伜惠縺励↑縺・| 繧｢繧ｻ繝・ヨID縺瑚ｦ九▽縺九ｉ縺ｪ縺・|
| `ASSET_DELETED` | 閭梧勹/BGM/SE | 蜑企勁貂医∩ | 繧｢繧ｻ繝・ヨ縺悟炎髯､貂医∩迥ｶ諷具ｼ・deletedAt` 縺碁撼null・・|
| `ASSET_KIND_MISMATCH` | 閭梧勹/BGM/SE | 遞ｮ蛻･荳堺ｸ閾ｴ | 繧｢繧ｻ繝・ヨ遞ｮ蛻･・・mage/audio・峨′逕ｨ騾斐→荳閾ｴ縺励↑縺・|
| `ASSET_NOT_USABLE` | 閭梧勹/BGM/SE | 讓ｩ髯舌↑縺・| 繝ｦ繝ｼ繧ｶ繝ｼ縺梧園譛・縺頑ｰ励↓蜈･繧翫＠縺ｦ縺・↑縺・ｼ井ｻ紋ｺｺ縺ｮ繧｢繧ｻ繝・ヨ・・|
| `CHARACTER_MISSING` | 隧ｱ閠・遶九■邨ｵ | 蟄伜惠縺励↑縺・| 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼID縺瑚ｦ九▽縺九ｉ縺ｪ縺・|
| `CHARACTER_DELETED` | 隧ｱ閠・遶九■邨ｵ | 蜑企勁貂医∩ | 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺悟炎髯､貂医∩迥ｶ諷具ｼ・deletedAt` 縺碁撼null・・|
| `CHARACTER_NOT_USABLE` | 隧ｱ閠・遶九■邨ｵ | 讓ｩ髯舌↑縺・髱槫・髢・| 謇譛・縺頑ｰ励↓蜈･繧翫＠縺ｦ縺・↑縺・√∪縺溘・莉紋ｺｺ縺ｮ髱槫・髢九く繝｣繝ｩ繧ｯ繧ｿ繝ｼ |
| `CHARACTER_IMAGE_MISSING` | 遶九■邨ｵ逕ｻ蜒・| 蟄伜惠縺励↑縺・| CharacterImage ID縺瑚ｦ九▽縺九ｉ縺ｪ縺・|
| `CHARACTER_IMAGE_MISMATCH` | 遶九■邨ｵ逕ｻ蜒・| 逕ｻ蜒終D/繧ｭ繝｣繝ｩID縺ｮ荳堺ｸ閾ｴ | `portrait.imageId` 縺・`portrait.characterId` 縺ｫ螻槭＠縺ｦ縺・↑縺・|
| `PORTRAIT_KEY_MISMATCH` | 遶九■邨ｵ逕ｻ蜒・| key縺ｮ荳肴紛蜷・| 繧ｯ繝ｩ繧､繧｢繝ｳ繝亥・縺ｮ `portrait.key` 縺ｨDB荳翫・ canonical 縺ｪ `key` 縺御ｸ堺ｸ閾ｴ |
| `PORTRAITS_INVALID` | 遶九■邨ｵ蜈ｨ菴・| 讒矩荳肴ｭ｣ | `portraits` 驟榊・縺ｮ讒矩縺ｫ蝠城｡後′縺ゅｋ・・haracterId/imageId 谺關ｽ遲会ｼ・|

#### API繧ｨ繝ｳ繝峨・繧､繝ｳ繝・
```
GET /games/:id/reference-diagnostics
```

- **隱崎ｨｼ**: SupabaseAuthGuard 縺ｧ owner 縺ｮ縺ｿ・・elf.ownerId == req.user.userId・・
- **繧ｯ繧ｨ繝ｪ**: 縺ｪ縺・
- **霑泌唆**:
  ```ts
  interface GameReferenceDiagnosticsResult {
    issues: GameReferenceDiagnosticIssue[]
    counts: {
      warning: number // 隴ｦ蜻顔ｷ乗焚・医◆縺縺・warnings 竕 allIssues.length 縺ｮ蝣ｴ蜷医・菴咲ｽｮ莉倥￠縺ｯ讀懆ｨ趣ｼ・
    }
    checkedAt: ISO8601Timestamp
  }
  
  interface GameReferenceDiagnosticIssue {
    id: string                                // 荳諢上・issueID・井ｾ・ `ref_<hash>`・・
    source: 'reference'                       // 隴ｦ蜻顔ｨｮ蛻･・・cenarioCheck蜀・〒縺ｮ隴伜挨逕ｨ・・
    severity: 'warning'                       // 蟶ｸ縺ｫ'warning'・医お繝ｩ繝ｼ縺ｯ霑斐＆縺ｪ縺・ｼ・
    code: GameReferenceDiagnosticCode         // 隴ｦ蜻翫さ繝ｼ繝会ｼ井ｸ願ｨ倩｡ｨ繧貞盾辣ｧ・・
    message: string                           // UI蜷代￠繝｡繝・そ繝ｼ繧ｸ・域律譛ｬ隱橸ｼ・
    field: 'bgAssetId' | 'musicAssetId' | 'sfxAssetId' | 'speakerCharacterId' | 'portraits' | (game-level)
    refId: string | null                      // 蜿ら・蜈・D・・ssetId, characterId 遲会ｼ峨ゅご繝ｼ繝蝗ｺ譛峨・ null
    sceneId: string | null                    // 蟇ｾ雎｡繧ｷ繝ｼ繝ｳID・医ご繝ｼ繝蝗ｺ譛峨・ null・・
    sceneName: string                         // 蟇ｾ雎｡繧ｷ繝ｼ繝ｳ蜷搾ｼ医ご繝ｼ繝蝗ｺ譛画凾縺ｯ遨ｺ譁・ｭ怜・・・
    sceneOrder: number | null                 // 蟇ｾ雎｡繧ｷ繝ｼ繝ｳ縺ｮ逡ｪ蜿ｷ・・-indexed・峨ゅご繝ｼ繝蝗ｺ譛峨・ null
    nodeId: string | null                     // 蟇ｾ雎｡繝弱・繝迂D・医ご繝ｼ繝蝗ｺ譛峨・ null・・
    nodeOrder: number | null                  // 蟇ｾ雎｡繝弱・繝峨・逡ｪ蜿ｷ・・-indexed・峨ゅご繝ｼ繝蝗ｺ譛峨・ null
    nodePreview: string                       // 蟇ｾ雎｡繝弱・繝峨・繝・く繧ｹ繝医・繝ｬ繝薙Η繝ｼ・域怙蛻昴・50譁・ｭ暦ｼ・
  }
  ```

#### 繧ｨ繝・ぅ繧ｿ逕ｻ髱｢縺ｧ縺ｮUI邨ｱ蜷・
- `/my/games/:id/edit` 縺ｮ縲後す繝翫Μ繧ｪ繝√ぉ繝・け縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ蜀・〒縲∵里蟄倥・ localIssues・域ｧ矩繝√ぉ繝・け・峨→邨ｱ蜷郁｡ｨ遉ｺ縲・
- referenceDiagnostics 縺碁撼null譎ゑｼ・
  - 蜿ら・險ｺ譁ｭ縺ｮ issues 繧・warnings 縺ｫ螟画鋤・・severity = 'warning'`・峨＠縲〕ocalIssues 縺ｫ霑ｽ蜉縲・
  - 蜈ｨ issues 繧帝㍾螟ｧ蠎ｦ鬆・ｼ・rror > warning > info・峨〒荳ｦ縺ｳ譖ｿ縺医・
  - warning 莉ｶ謨ｰ縺ｫ蜿ら・險ｺ譁ｭ縺ｮ warning 莉ｶ謨ｰ繧貞刈邂励・
- 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ陦ｨ遉ｺ・・
  - API 蜿門ｾ怜､ｱ謨玲凾縺ｯ `referenceDiagnosticsError` 繧誕lert縺ｾ縺溘・ UI縺ｧ騾夂衍縲・
- 繝ｪ繧｢繝ｫ繧ｿ繧､繝譖ｴ譁ｰ・・
  - 繝弱・繝芽ｿｽ蜉/蜑企勁/繧ｷ繝ｼ繝ｳ蜑企勁譎ゅ↓ `refreshReferenceDiagnostics()` 繧貞・螳溯｡後＠縲ゞI 繧呈怙譁ｰ蛹悶・
  - onMounted譎ゅ↓繧り・蜍募叙蠕励・

#### 螳溯｣・｣懆ｶｳ
- 蟇ｾ雎｡繧ｲ繝ｼ繝縺ｮ蜈ｨ繧ｷ繝ｼ繝ｳ/繝弱・繝峨ｒ荳諡ｬ繝ｭ繝ｼ繝峨＠縲∝盾辣ｧ縺輔ｌ縺ｦ縺・ｋ assetId / characterId / imageId 繧貞庶髮・
- 蜿朱寔縺励◆蜈ｨID繧・Prisma `findMany` + `in: []` 繧ｬ繝ｼ繝峨〒荳諡ｬ蜿門ｾ励＠縲｀ap 蛹悶＠縺ｦ繝ｭ繝ｼ繧ｫ繝ｫ讀懆ｨｼ・・+1 蝗樣∩・・
- 縺頑ｰ励↓蜈･繧奇ｼ・avorite / FavoriteCharacter・峨ｂ蜷梧ｧ倥↓荳諡ｬ蜿門ｾ励＠縲∵園譛芽・∪縺溘・縺頑ｰ励↓蜈･繧頑ｸ医∩縺九ｒ繝槭ャ繝励〒蛻､螳・
- portrait key normalize 縺ｯ Node 菫晏ｭ俶凾縺ｮ譌｢蟄伜・逅・→邨ｱ蜷・

#### 蟆・擂隱ｲ鬘・
- Auto-repair・郁・蜍穂ｿｮ豁｣・・  warning 繧貞炎髯､縺励※鄂ｮ縺肴鋤縺医ｋ讖溯・縲・VP 縺ｧ縺ｯ螳溯｣・＠縺ｪ縺・・
- Quarantine・亥撫鬘檎ｴ譚舌ｒ荳譎る囈髮｢・・ 繧ｲ繝ｼ繝螳溯｡梧凾縺ｫ蜿ら・繧ｨ繝ｩ繝ｼ譎らせ縺ｧ fallback 逕ｻ蜒上ｒ陦ｨ遉ｺ縺ｪ縺ｩ縲・VP 縺ｧ縺ｯ螳溯｣・＠縺ｪ縺・・
- 莉冶ｨ隱槫ｯｾ蠢・ 迴ｾ迥ｶ譌･譛ｬ隱槭・縺ｿ縲・
- 荳ｦ陦檎ｷｨ髮・凾縺ｮ蜿ら・險ｺ譁ｭ縺ｮ蜀崎ｨ育ｮ励ち繧､繝溘Φ繧ｰ縲・

### 繧ｲ繝ｼ繝蜀・盾辣ｧ繧｢繧ｻ繝・ヨ讓ｩ髯舌Ν繝ｼ繝ｫ・・VP譽壼査縺・ 2026-05-04・・

#### 蝓ｺ譛ｬ繝ｫ繝ｼ繝ｫ
- 繧ｲ繝ｼ繝蛻ｶ菴懈凾縺ｫ蜿ら・縺ｧ縺阪ｋ邏譚舌・縲瑚・蛻・・邏譚舌阪→縲後♀豌励↓蜈･繧頑ｸ医∩邏譚舌阪ｒ蝓ｺ譛ｬ縺ｨ縺吶ｋ縲・
- 縺頑ｰ励↓蜈･繧翫・縲後＞縺・・縲阪□縺代〒縺ｪ縺上∝宛菴懈凾縺ｮ邏譚先｣壹・繝悶ャ繧ｯ繝槭・繧ｯ縺ｨ縺励※謇ｱ縺・・
- 蛻ｶ菴懃畑Picker縺ｫ縺ｯ蜈ｨ蜈ｬ髢狗ｴ譚舌ｒ逶ｴ謗･荳ｦ縺ｹ縺壹√♀豌励↓蜈･繧頑ｸ医∩邏譚舌↓邨槭▲縺ｦ陦ｨ遉ｺ縺吶ｋ縲・
- 蜑企勁貂医∩邏譚舌・蜿ら・荳榊庄縺ｨ縺吶ｋ縲・
- 邏譚千ｨｮ蛻･縺檎畑騾斐→荳閾ｴ縺励↑縺・盾辣ｧ縺ｯ荳榊庄縺ｨ縺吶ｋ縲・

#### 繧｢繧ｻ繝・ヨ遞ｮ蛻･繝ｫ繝ｼ繝ｫ
- 閭梧勹逕ｻ蜒・ `image/*` 縺ｮ繧｢繧ｻ繝・ヨ
- 繧ｫ繝舌・逕ｻ蜒・ `image/*` 縺ｮ繧｢繧ｻ繝・ヨ
- BGM: `audio/*` 縺ｮ繧｢繧ｻ繝・ヨ
- SE: `audio/*` 縺ｮ繧｢繧ｻ繝・ヨ
- 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ: 閾ｪ蛻・・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縲√∪縺溘・縺頑ｰ励↓蜈･繧頑ｸ医∩繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ
- 遶九■邨ｵ/陦ｨ諠・ 驕ｸ謚樊ｸ医∩繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｮ `CharacterImage`

#### UI繝ｫ繝ｼ繝ｫ
- `AssetPicker` 縺ｯ縲瑚・蛻・・繧｢繧ｻ繝・ヨ / 縺頑ｰ励↓蜈･繧翫阪・2繧ｿ繝匁ｧ区・縺ｨ縺励～type="image" | "audio"` 繧剃ｸ｡繧ｿ繝悶↓驕ｩ逕ｨ縺吶ｋ縲・
- `CharacterPicker` 縺ｯ縲瑚・蛻・・繧ｭ繝｣繝ｩ / 縺頑ｰ励↓蜈･繧翫阪・2繧ｿ繝匁ｧ区・縺ｨ縺吶ｋ縲・
- 蜈ｬ髢狗ｴ譚舌ｒ蛻ｶ菴懊〒菴ｿ縺・◆縺・ｴ蜷医・縲√∪縺壹♀豌励↓蜈･繧顔匳骭ｲ縺励※縺九ｉPicker縺ｧ驕ｸ謚槭☆繧九・
- 繝弱・繝臥ｷｨ髮・〒縺ｯ縲∬レ譎ｯ=`AssetPicker type="image"`縲。GM/SE=`AssetPicker type="audio"` 繧剃ｽｿ逕ｨ縺吶ｋ縲・
- 繧ｲ繝ｼ繝蜈ｨ菴楢ｨｭ螳壹・繧ｫ繝舌・逕ｻ蜒上・ `AssetPicker type="image"` 繧剃ｽｿ逕ｨ縺吶ｋ縲・

#### API蛛ｴ繝ｫ繝ｼ繝ｫ・育炊諠ｳ・・
- 菫晏ｭ俶凾縺ｯ `assetId` / `characterId` / `characterImageId` 縺ｫ縺､縺・※縲梧悽莠ｺ謇譛・or 縺頑ｰ励↓蜈･繧頑ｸ医∩縲阪ｒ讀懆ｨｼ縺吶ｋ縲・
- `image/audio/character` 縺ｪ縺ｩ逕ｨ騾泌挨縺ｮ蝙倶ｸ堺ｸ閾ｴ縺ｯ諡貞凄縺吶ｋ縲・
- 蜑企勁貂医∩邏譚舌・蜿ら・荳榊庄邏譚舌・諡貞凄縺吶ｋ縲・

#### 迴ｾ迥ｶ譽壼査縺暦ｼ・026-05-04 譖ｴ譁ｰ・・
- 繧ｫ繝舌・逕ｻ蜒擾ｼ・coverAssetId`・峨・ API 縺ｧ縲梧悽莠ｺ謇譛・or 縺頑ｰ励↓蜈･繧頑ｸ医∩縲阪形image/*`縲阪梧悴蜑企勁縲阪ｒ讀懆ｨｼ貂医∩縲・
- Node菫晏ｭ俶凾縺ｮ `bgAssetId` / `musicAssetId` / `sfxAssetId` 繧・API 蛛ｴ縺ｧ莉･荳九ｒ讀懆ｨｼ貂医∩・・026-05-04 MVP・峨・
  - `bgAssetId`: `image/*` 縺ｮ縺ｿ縲よ悽莠ｺ謇譛・or 縺頑ｰ励↓蜈･繧頑ｸ医∩縲ょ炎髯､貂医∩荳榊庄縲Ａnull`/譛ｪ謖・ｮ壹・險ｱ蜿ｯ縲・
  - `musicAssetId` / `sfxAssetId`: `audio/*` 縺ｮ縺ｿ縲よ悽莠ｺ謇譛・or 縺頑ｰ励↓蜈･繧頑ｸ医∩縲ょ炎髯､貂医∩荳榊庄縲Ａnull`/譛ｪ謖・ｮ壹・險ｱ蜿ｯ縲・
  - 遞ｮ蛻･驕輔＞・育判蜒・竊・髻ｳ螢ｰ繝輔ぅ繝ｼ繝ｫ繝臥ｭ会ｼ峨・ `BadRequestException`縲∵ｨｩ髯舌↑縺励・ `ForbiddenException`縲・
  - 蜈ｱ騾壹Ο繧ｸ繝・け縺ｯ `GamesService.assertGameAssetUsable(userId, assetId, 'image'|'audio')` 縺ｫ髮・ｴ・・
  - 繧ｫ繝舌・逕ｻ蜒上・ `assertCoverAssetUsable` 縺ｯ縺薙・蜈ｱ騾夐未謨ｰ縺ｫ蟋碑ｭｲ縲・
- 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ蜿ら・・・speakerCharacterId` / `portraits[*].characterId`・峨・ Node 菫晏ｭ俶凾繝舌Μ繝・・繧ｷ繝ｧ繝ｳ繧貞ｮ溯｣・ｸ医∩・・026-05-04 MVP・峨・
  - `speakerCharacterId`: 譛ｬ莠ｺ謇譛・or 蜈ｬ髢九°縺､縺頑ｰ励↓蜈･繧頑ｸ医∩繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｮ縺ｿ菫晏ｭ伜庄閭ｽ縲Ａnull`/譛ｪ謖・ｮ壹・險ｱ蜿ｯ縲・
  - 蜈ｱ騾壹Ο繧ｸ繝・け縺ｯ `GamesService.assertGameCharacterUsable(userId, characterId)` 縺ｫ髮・ｴ・・
- 遶九■邨ｵ JSON・・portraits`・峨・ Node 菫晏ｭ俶凾繝舌Μ繝・・繧ｷ繝ｧ繝ｳ繧貞ｮ溯｣・ｸ医∩・・026-05-04 MVP・峨・
  - `portraits[*].imageId` 縺ｯ `CharacterImage.id` 縺ｨ縺励※蟄伜惠縺励‘ntry 縺ｮ `characterId` 縺ｫ螻槭＠縺ｦ縺・ｋ蠢・ｦ√′縺ゅｋ縲・
  - `portraits[*].key` 縺ｯ API 菫晏ｭ俶凾縺ｫ DB 荳翫・ canonical `CharacterImage.key` 縺ｸ荳頑嶌縺肴ｭ｣隕丞喧縺輔ｌ繧具ｼ医け繝ｩ繧､繧｢繝ｳ繝医°繧蛾√ｉ繧後◆蛟､縺ｯ菫｡逕ｨ縺励↑縺・ｼ峨・
  - 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｮ繧｢繧ｯ繧ｻ繧ｹ蜿ｯ蜷ｦ縺ｯ `assertGameCharacterUsable` 縺ｨ蜷後Ν繝ｼ繝ｫ縺ｧ讀懆ｨｼ縺輔ｌ繧九・
- `portraitAssetId` 縺ｯ莠呈鋤邯ｭ謖√・繝ｬ繧ｬ繧ｷ繝ｼ逕ｻ蜒上い繧ｻ繝・ヨ蜿ら・繝輔ぅ繝ｼ繝ｫ繝峨ら樟陦檎ｫ九■邨ｵ縺ｯ `portraits[*].imageId` 繧剃ｽｿ縺・・
  - `portraitAssetId` 縺碁撼遨ｺ縺ｧ謖・ｮ壹＆繧後◆蝣ｴ蜷医・ `assertGameAssetUsable(userId, portraitAssetId, 'image')` 繧帝壹☆縲・
  - `null`/譛ｪ謖・ｮ・遨ｺ譁・ｭ励・險ｱ蜿ｯ縲・
- Node 譖ｴ譁ｰ譎ゅ・謇譛臥｢ｺ隱阪ｒ蠑ｷ蛹匁ｸ医∩・・026-05-04 MVP・峨・
  - `node.id` 縺梧欠螳壹＆繧後※縺・ｋ蝣ｴ蜷医√◎縺ｮ繝弱・繝峨′ URL 縺ｮ `sceneId` 驟堺ｸ九〒縺ゅｋ縺薙→繧呈､懆ｨｼ縺吶ｋ縲・
  - 繧ｯ繝ｩ繧､繧｢繝ｳ繝医°繧蛾√ｉ繧後◆ `sceneId` 繝輔ぅ繝ｼ繝ｫ繝峨・辟｡隕悶＠縲ゞRL 縺ｮ `sceneId` 縺ｫ蝗ｺ螳壹☆繧具ｼ医け繝ｭ繧ｹ繧ｷ繝ｼ繝ｳ遘ｻ蜍輔ｒ髦ｲ豁｢・峨・
- `POST /characters/:id/favorite` 縺ｫ髦ｲ蠕｡繧定ｿｽ蜉貂医∩・・026-05-04 MVP・峨・
  - 蟄伜惠縺励↑縺・蜑企勁貂医∩繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｮ縺頑ｰ励↓蜈･繧翫・ `NotFoundException` 縺ｧ諡貞凄縲・
  - 髱槫・髢九・莉紋ｺｺ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｮ縺頑ｰ励↓蜈･繧翫・ `ForbiddenException` 縺ｧ諡貞凄縲・

### 繧｢繧ｻ繝・ヨ蜑企勁譎ゅ・蛻ｩ逕ｨ蠖ｱ髻ｿ陦ｨ遉ｺMVP・・026-05-04・・

#### 讎りｦ・
繧｢繧ｻ繝・ヨ謇譛芽・′閾ｪ蛻・・繧｢繧ｻ繝・ヨ繧貞炎髯､縺励ｈ縺・→縺励◆縺ｨ縺阪↓縲√◎縺ｮ繧｢繧ｻ繝・ヨ縺後ご繝ｼ繝蜀・〒縺ｩ縺・ｽｿ繧上ｌ縺ｦ縺・ｋ縺九ｒ蜑企勁遒ｺ隱攻I縺ｧ莠句燕陦ｨ遉ｺ縺吶ｋ縲ょ炎髯､閾ｪ菴薙・繝悶Ο繝・け縺励↑縺・ｼ・arning陦ｨ遉ｺ縺ｮ縺ｿ・峨・

#### API
`GET /assets/:id/usage-impact` (`SupabaseAuthGuard` 蠢・医√い繧ｻ繝・ヨ謇譛芽・・縺ｿ螳溯｡悟庄閭ｽ)

- 莉紋ｺｺ縺ｮ繧｢繧ｻ繝・ヨID繧呈欠螳壹＠縺溷ｴ蜷・ `ForbiddenException`
- 蟄伜惠縺励↑縺・蜑企勁貂医∩繧｢繧ｻ繝・ヨ: `NotFoundException`
- 蜑企勁貂医∩繧｢繧ｻ繝・ヨ縺ｮMVP蛻､譁ｭ: `NotFoundException` 縺ｧ霑斐☆・亥炎髯､貂医∩繧｢繧ｻ繝・ヨ縺ｯ險ｺ譁ｭ荳崎ｦ√↑縺溘ａ・・

#### 險ｺ譁ｭ蟇ｾ雎｡繝輔ぅ繝ｼ繝ｫ繝・
| 繝輔ぅ繝ｼ繝ｫ繝・| 繝｢繝・Ν | 蛯呵・|
|-----------|-------|------|
| `coverAssetId` | `GameProject` | 繧ｫ繝舌・逕ｻ蜒・|
| `bgAssetId` | `GameNode` | 閭梧勹 |
| `musicAssetId` | `GameNode` | BGM |
| `sfxAssetId` | `GameNode` | SE |
| `portraitAssetId` | `GameNode` | 遶九■邨ｵ莠呈鋤・医Ξ繧ｬ繧ｷ繝ｼ繝輔ぅ繝ｼ繝ｫ繝会ｼ・|

- `portraits[*].imageId` 縺ｯ `CharacterImage` 蜿ら・縺ｧ縺ゅｊ縲、sset ID 縺ｧ縺ｯ縺ｪ縺・◆繧∽ｻ雁屓縺ｮ險ｺ譁ｭ蟇ｾ雎｡螟悶ょｰ・擂逧・↓ `CharacterImage` 竊・`Asset` 縺ｮ騾・ｼ輔″縺悟ｿ・ｦ√↓縺ｪ縺｣縺溷ｴ蜷医↓蟇ｾ蠢懊☆繧九・
- 蟇ｾ雎｡繧ｲ繝ｼ繝縺ｯ `GameProject.deletedAt: null` 縺ｮ繧ｲ繝ｼ繝縺ｮ縺ｿ・郁ｫ也炊蜑企勁貂医∩繧ｲ繝ｼ繝縺ｯ髯､螟厄ｼ峨・
- 蜈ｬ髢九・髱槫・髢九ご繝ｼ繝縺ｮ荳｡譁ｹ繧帝寔險亥ｯｾ雎｡縺ｫ縺吶ｋ縲・

#### 繝ｬ繧ｹ繝昴Φ繧ｹ險ｭ險・
- `totalGameCount` / `ownGameCount` / `otherGameCount`: distinct 繧ｲ繝ｼ繝莉ｶ謨ｰ
- `totalReferenceCount` / `ownReferenceCount` / `otherReferenceCount`: 蜿ら・邂・園蜷郁ｨ・
- `byField`: 繝輔ぅ繝ｼ繝ｫ繝牙挨莉ｶ謨ｰ・・over/bg/music/sfx/portrait・・
- `ownGameSamples`: 閾ｪ蛻・・繧ｲ繝ｼ繝縺ｮ譛螟ｧ10莉ｶ繧ｵ繝ｳ繝励Ν・・sampleLimit: 10`縲～hasMoreOwnGames: boolean`・・
- `checkedAt`: 險ｺ譁ｭ螳溯｡梧凾蛻ｻ・・SO 8601・・

#### 莉紋ｺｺ繧ｲ繝ｼ繝縺ｮ繝励Λ繧､繝舌す繝ｼ譁ｹ驥・
莉紋ｺｺ縺ｮ繧ｲ繝ｼ繝縺ｯ縲∝・髢九・髱槫・髢九↓髢｢繧上ｉ縺・**莉ｶ謨ｰ縺縺・* 霑斐☆縲ゆｻ･荳九・霑斐＆縺ｪ縺・
- 莉紋ｺｺ縺ｮ繧ｲ繝ｼ繝繧ｿ繧､繝医Ν
- 莉紋ｺｺ縺ｮ繧ｷ繝ｼ繝ｳ蜷阪・繝弱・繝画悽譁・
- 莉紋ｺｺ縺ｮ userId / ownerId
- 莉紋ｺｺ繧ｲ繝ｼ繝縺ｮ蜈ｬ髢・髱槫・髢句・險ｳ

**逅・罰**: 髱槫・髢九ご繝ｼ繝縺ｮ蟄伜惠繝ｻ繧ｿ繧､繝医Ν繝ｻ蜀・ｮｹ縺後い繧ｻ繝・ヨ謇譛芽・↓貍上ｌ繧九・繧帝∩縺代ｋ縺溘ａ縲ゅ∪縺溘√瑚ｪｰ縺後％縺ｮ邏譚舌ｒ菴ｿ縺｣縺ｦ縺・ｋ縺九阪・逶｣隕匁ｩ溯・縺ｫ縺ｪ繧峨↑縺・ｈ縺・↓縺吶ｋ縺溘ａ縲・

#### Asset.isPublic / visibility 縺ｫ縺､縺・※
迴ｾ陦後・ `Asset` 繝｢繝・Ν縺ｫ縺ｯ `isPublic` / visibility 繝輔ぅ繝ｼ繝ｫ繝峨′縺ｪ縺・ら樟迥ｶ縺ｯ `deletedAt: null` 縺悟ｮ溯ｳｪ逧・↑蜈ｬ髢区擅莉ｶ縲ゅ碁撼蜈ｬ髢句喧譎ゅ・蠖ｱ髻ｿ陦ｨ遉ｺ縲阪・蟆・擂 `Asset.visibility` / `Asset.isPublic` 遲峨ｒ險ｭ險医☆繧九→縺阪↓謗･邯壹☆繧九・VP縺ｧ縺ｯ蟇ｾ雎｡螟悶・

### 蜈ｱ譛臥ｴ譚舌・蜀阪い繝・・繝ｭ繝ｼ繝・繧ｳ繝斐・蝠城｡鯉ｼ郁ｨｭ險郁ｫ也せ・・

繝ｦ繝ｼ繧ｶ繝ｼ縺悟盾辣ｧ蛻・ｌ繧帝∩縺代ｋ縺溘ａ縺ｫ莉紋ｺｺ縺ｮ繧｢繧ｻ繝・ヨ繧偵ム繧ｦ繝ｳ繝ｭ繝ｼ繝峨＠縺ｦ閾ｪ蛻・・繧｢繧ｻ繝・ヨ縺ｨ縺励※蜀阪い繝・・繝ｭ繝ｼ繝峨☆繧句庄閭ｽ諤ｧ縺後≠繧九・

#### 蝠城｡檎せ
- 莠ｺ豌怜ｺｦ縺悟・謨｣縺励∵悽譚･縺ｮ菴懆・∈縺ｮ隧穂ｾ｡繧・茜逕ｨ螳溽ｸｾ縺瑚ｦ九∴縺･繧峨￥縺ｪ繧・
- 蜈・ｽ懆・∈縺ｮ謗｡逕ｨ螳溽ｸｾ繝ｻ繧ｯ繝ｬ繧ｸ繝・ヨ縺瑚ｿ斐ｉ縺ｪ縺・
- 菴懆・′蜑企勁/蜈ｬ髢句●豁｢縺励◆縺・ｴ譚舌′縲∝挨繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ蜀阪い繝・・繝ｭ繝ｼ繝峨→縺励※谿九ｊ邯壹￠繧・
- 蛻ｩ逕ｨ譚｡莉ｶ繝ｻ繝ｩ繧､繧ｻ繝ｳ繧ｹ繝ｻ讓ｩ蛻ｩ蜃ｦ逅・′譖匁乂縺ｫ縺ｪ繧・
- 縲悟盾辣ｧ蛻・ｌ蝗樣∩縲阪・縺溘ａ縺ｫ繧ｳ繝斐・譁・喧縺悟ｼｷ縺ｾ繧九→縲∫ｴ譚仙・譛峨し繝ｼ繝薙せ縺ｨ縺励※縺ｮ菫｡鬆ｼ諤ｧ縺瑚誠縺｡繧・

#### MVP譁ｹ驥・
- 陦ｨ遉ｺ蜿ｯ閭ｽ縺ｪ逕ｻ蜒・髻ｳ螢ｰ縺ｮ螳悟・縺ｪ繝繧ｦ繝ｳ繝ｭ繝ｼ繝蛾亟豁｢縺ｯ迴ｾ螳溽噪縺ｧ縺ｯ縺ｪ縺・ｼ・igned URL 縺ｯ繧｢繧ｯ繧ｻ繧ｹ蛻ｶ蠕｡縺ｧ縺ゅ▲縺ｦDRM縺ｧ縺ｯ縺ｪ縺・ｼ・
- MVP縺ｧ縺ｯ謚陦鍋噪縺ｪ讀懷・繝ｻ繝悶Ο繝・け縺ｯ螳溯｣・＠縺ｪ縺・
- 蟇ｾ遲悶・縲悟ｮ悟・髦ｲ豁｢縲阪〒縺ｯ縺ｪ縺上√・繝ｭ繝繧ｯ繝郁ｨｭ險医〒豁｣隕上Ν繝ｼ繝医ｒ菴ｿ縺・ｄ縺吶￥縺吶ｋ譁ｹ蜷代ｒ逶ｮ謖・☆
- 豁｣隕乗治逕ｨ繝ｫ繝ｼ繝医ｒ萓ｿ蛻ｩ縺ｫ縺励※縲∝・繧｢繝・・繝ｭ繝ｼ繝峨☆繧九ｈ繧雁・蠑丞茜逕ｨ縺ｮ譁ｹ縺悟ｾ励↓縺ｪ繧玖ｨｭ險医↓蟇・○繧具ｼ遺・縲梧ｭ｣隕乗治逕ｨ繝ｫ繝ｼ繝茨ｼ・X險ｭ險域婿驥晢ｼ峨榊盾辣ｧ・・

#### 蟆・擂縺ｮ蟇ｾ遲匁｡・
- `GameAssetReference` / `AssetUsage` 縺ｫ繧医ｋ謗｡逕ｨ髢｢菫ゅ・譏守､ｺ險倬鹸
  - 繧ｲ繝ｼ繝縺後←縺ｮ邏譚舌ｒ螳滄圀縺ｫ謗｡逕ｨ縺励※縺・ｋ縺九ｒ譏守､ｺ逧・↓險倬鹸縺吶ｋ
  - 繧｢繧ｻ繝・ヨ菴懆・↓謗｡逕ｨ謨ｰ/菴ｿ逕ｨ謨ｰ縺ｨ縺励※螳溽ｸｾ縺瑚ｿ斐ｋ蝓ｺ逶､
- `sourceAssetId` / `derivedFromAssetId` 縺ｫ繧医ｋ豢ｾ逕溷・霑ｽ霍｡
- 繝輔ぃ繧､繝ｫhash / perceptual hash / audio fingerprint 縺ｫ繧医ｋ驥崎､・､懷・縺ｯ蟆・擂隱ｲ鬘鯉ｼ郁ｪ､讀懃衍繝ｻ險育ｮ励さ繧ｹ繝医・蝗樣∩蜿ｯ閭ｽ諤ｧ縺後≠繧九◆繧｀VP縺ｧ縺ｯ螳溯｣・＠縺ｪ縺・ｼ・
- 繝ｩ繧､繧ｻ繝ｳ繧ｹ/蛻ｩ逕ｨ譚｡莉ｶ/繧ｯ繝ｬ繧ｸ繝・ヨ譁ｹ驥昴・謨ｴ逅・
- 蜑企勁/髱槫・髢・譁ｰ隕丞茜逕ｨ蛛懈ｭ｢/譌｢蟄伜茜逕ｨ邯咏ｶ・讓ｩ蛻ｩ萓ｵ螳ｳ蛛懈ｭ｢縺ｮ諢丞袖繧貞・縺代ｋ
  - 繧ｮ繝｣繝ｩ繝ｪ繝ｼ縺九ｉ髱櫁｡ｨ遉ｺ/譁ｰ隕丞茜逕ｨ蛛懈ｭ｢
  - 譌｢蟄倥ご繝ｼ繝縺ｧ縺ｮ邯咏ｶ壼茜逕ｨ繧定ｨｱ縺吶い繝ｼ繧ｫ繧､繝・
  - 讓ｩ蛻ｩ萓ｵ螳ｳ/隕冗ｴ・＆蜿阪↑縺ｩ縺ｮ蠑ｷ蛻ｶ蛛懈ｭ｢

### 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ蜑企勁譎ゅ・蛻ｩ逕ｨ蠖ｱ髻ｿ陦ｨ遉ｺMVP・・026-05-04・・

#### 讎りｦ・
繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ謇譛芽・′閾ｪ蛻・・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ繧貞炎髯､縺励ｈ縺・→縺励◆縺ｨ縺阪↓縲√◎縺ｮ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺後ご繝ｼ繝蜀・〒縺ｩ縺・ｽｿ繧上ｌ縺ｦ縺・ｋ縺九ｒ蜑企勁遒ｺ隱攻I縺ｧ莠句燕陦ｨ遉ｺ縺吶ｋ縲ょ炎髯､閾ｪ菴薙・繝悶Ο繝・け縺励↑縺・ｼ・arning陦ｨ遉ｺ縺ｮ縺ｿ・峨ゅい繧ｻ繝・ヨ蜑企勁譎・VP縺ｮ讓ｪ螻暮幕縺縺後∝盾辣ｧ繝輔ぅ繝ｼ繝ｫ繝峨′繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ蝗ｺ譛峨・縺溘ａ螳溯｣・・迢ｬ遶九・

#### API
`GET /my/characters/:id/usage-impact` (`SupabaseAuthGuard` 蠢・医√く繝｣繝ｩ繧ｯ繧ｿ繝ｼ謇譛芽・・縺ｿ螳溯｡悟庄閭ｽ)

- 蟄伜惠縺励↑縺・蜑企勁貂医∩繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ: `NotFoundException`
- 莉紋ｺｺ縺ｮ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼID繧呈欠螳壹＠縺溷ｴ蜷・ `ForbiddenException`

#### 險ｺ譁ｭ蟇ｾ雎｡繝輔ぅ繝ｼ繝ｫ繝・
| 繝輔ぅ繝ｼ繝ｫ繝・| 繝｢繝・Ν | 蛯呵・|
|-----------|-------|------|
| `speakerCharacterId` | `GameNode` | 隧ｱ閠・→縺励※險ｭ螳壹＆繧後※縺・ｋ蝣ｴ蜷・|
| `portraits[*].characterId` | `GameNode` | 遶九■邨ｵ驟咲ｽｮ縺ｮ characterId 荳閾ｴ |
| `portraits[*].imageId` | `GameNode` | 遶九■邨ｵ驟咲ｽｮ縺ｮ imageId 縺悟ｯｾ雎｡繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ逕ｻ蜒終D縺ｫ荳閾ｴ縺吶ｋ蝣ｴ蜷・|

- `portraits` 縺ｯ JSON 繝輔ぅ繝ｼ繝ｫ繝峨・縺溘ａ縲．B蛛ｴ繝輔ぅ繝ｫ繧ｿ縺ｧ縺ｯ縺ｪ縺・TypeScript 蛛ｴ縺ｧ繝輔ぅ繝ｫ繧ｿ・・+1縺ｪ縺暦ｼ・
- 蟇ｾ雎｡繧ｲ繝ｼ繝縺ｯ `GameProject.deletedAt: null` 縺ｮ繧ｲ繝ｼ繝縺ｮ縺ｿ・郁ｫ也炊蜑企勁貂医∩繧ｲ繝ｼ繝縺ｯ髯､螟厄ｼ・
- 蜈ｬ髢九・髱槫・髢九ご繝ｼ繝縺ｮ荳｡譁ｹ繧帝寔險亥ｯｾ雎｡縺ｫ縺吶ｋ

#### 繝ｬ繧ｹ繝昴Φ繧ｹ險ｭ險・
- `characterId` / `totalGameCount` / `ownGameCount` / `otherGameCount`
- `totalReferenceCount` / `ownReferenceCount` / `otherReferenceCount`
- `ownByField`: 閾ｪ蛻・・繧ｲ繝ｼ繝縺ｧ縺ｮ繝輔ぅ繝ｼ繝ｫ繝牙挨莉ｶ謨ｰ・・{ speakerCharacterId, portraits }`・・
- `ownGameSamples`: 閾ｪ蛻・・繧ｲ繝ｼ繝縺ｮ譛螟ｧ10莉ｶ繧ｵ繝ｳ繝励Ν・・sampleLimit: 10`縲～hasMoreOwnGames: boolean`・・
- `checkedAt`: 險ｺ譁ｭ螳溯｡梧凾蛻ｻ・・SO 8601・・

#### 莉紋ｺｺ繧ｲ繝ｼ繝縺ｮ繝励Λ繧､繝舌す繝ｼ譁ｹ驥・
繧｢繧ｻ繝・ヨ蜑企勁譎・VP縺ｨ蜷後§譁ｹ驥晢ｼ壻ｻ紋ｺｺ縺ｮ繧ｲ繝ｼ繝縺ｯ **莉ｶ謨ｰ縺縺・* 霑斐☆縲ゆｻ･荳九・霑斐＆縺ｪ縺・
- 莉紋ｺｺ縺ｮ繧ｲ繝ｼ繝繧ｿ繧､繝医Ν / 繧ｷ繝ｼ繝ｳ蜷・/ 繝弱・繝画悽譁・
- 莉紋ｺｺ縺ｮ userId / ownerId
- 莉紋ｺｺ繧ｲ繝ｼ繝縺ｮ蜈ｬ髢・髱槫・髢句・險ｳ

#### 繧｢繧ｻ繝・ヨ蜑企勁譎・VP縺ｨ縺ｮ髢｢菫・
- 繧｢繧ｻ繝・ヨ蜑企勁譎・VP・・GET /assets/:id/usage-impact`・峨→險ｭ險域婿驥昴・繝ｬ繧ｹ繝昴Φ繧ｹ讒矩繧呈純縺医※縺・ｋ
- 繝輔Ο繝ｳ繝・I繧ゅい繧ｻ繝・ヨ蜑企勁繝｢繝ｼ繝繝ｫ縺ｫ蛟｣縺・～showDeleteModal` / `usageImpact` / `usageImpactLoading` / `usageImpactError` 縺ｧ邂｡逅・
- 繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ蝗ｺ譛峨・陦ｨ遉ｺ: 隧ｱ閠・ｼ・speakerCharacterId`・・ 遶九■邨ｵ驟咲ｽｮ・・portraits`・峨・2蛹ｺ蛻・

#### portraits 繝輔ぅ繝ｼ繝ｫ繝峨・螳溯｣・婿驥・
- `portraits` 縺ｯ Prisma JSON 繝輔ぅ繝ｼ繝ｫ繝峨・縺溘ａ縲．B 蛛ｴ縺ｧ `NOT: { portraits: null }` 縺ｮ繧医≧縺ｪ null 譚｡莉ｶ縺ｯ謖・ｮ壹＠縺ｪ縺・ｼ・risma 縺ｮ runtime validation 繧ｨ繝ｩ繝ｼ縺ｫ縺ｪ繧具ｼ・
- MVP 縺ｧ縺ｯ `scene: { project: { deletedAt: null } }` 縺ｮ縺ｿ DB 譚｡莉ｶ縺ｨ縺励∝呵｣懊ヮ繝ｼ繝峨ｒ蜈ｨ蜿門ｾ・
- TypeScript 蛛ｴ縺ｧ `Array.isArray(n.portraits)` 縺ｫ繧医▲縺ｦ邨槭ｊ霎ｼ縺ｿ縲∝推繧ｨ繝ｳ繝医Μ縺・object 縺ｧ縺ゅｋ縺薙→繝ｻ`characterId` / `imageId` 縺・string 縺ｧ縺ゅｋ縺薙→繧堤｢ｺ隱阪＠縺ｦ縺九ｉ豈碑ｼ・
- 荳肴ｭ｣縺ｪ JSON 蠖｢迥ｶ・・ull / object / malformed 驟榊・・峨′豺ｷ蝨ｨ縺励※繧・API 縺・500 縺ｫ縺ｪ繧峨↑縺・ｈ縺・・欧蛹悶＠縺ｦ縺・ｋ

### 繝ｫ繝ｼ繝・ぅ繝ｳ繧ｰ / 逕ｻ髱｢

- **繧ｨ繝・ぅ繧ｿ**: `/my/games/:id/edit`
  - 蟾ｦ:繧ｷ繝ｼ繝ｳ荳隕ｧ縲∽ｸｭ螟ｮ:繝弱・繝我ｸ隕ｧ縲∝承:繝励Ο繝代ユ繧｣(繝励Ξ繝薙Η繝ｼ蜷ｫ繧)
  - 蜿ｳ繝壹う繝ｳ縺ｯ縲碁壼ｸｸ陦ｨ遉ｺ / 蜈ｨ逕ｻ髱｢縲阪ｒ繝医げ繝ｫ(UI: *蜈ｨ逕ｻ髱｢ / 騾壼ｸｸ陦ｨ遉ｺ*, F 縺ｧ蛻・崛繝ｻEsc 縺ｧ髢峨§繧・
  - 繧ｹ繝・・繧ｸ縺ｯ 16:9 豈皮紫縺ｧ **StageCanvas** 縺ｫ邨ｱ荳縲る壼ｸｸ繝ｻ蜈ｨ逕ｻ髱｢繝ｻ繝・せ繝医・繝ｬ繧､縺吶∋縺ｦ縺ｧ**蜷御ｸ繧ｹ繧ｱ繝ｼ繝ｫ繝ｻ豈皮紫**縺ｧ謠冗判・・useStageScale` 縺ｧ螳滄ｫ倥＆px繧辰SS螟画焚 `--stage-h-px` 縺ｫ豬√＠縲√ヵ繧ｩ繝ｳ繝医・菴咏區繧・clamp() 縺ｧ繧ｹ繧ｱ繝ｼ繝ｫ・・
  - **縲悟・菴楢ｨｭ螳壹・*繝懊ち繝ｳ縺九ｉ**繧ｲ繝ｼ繝蜈ｨ菴楢ｨｭ螳壹Δ繝ｼ繝繝ｫ**繧帝幕縺代ｋ
    - 蝓ｺ譛ｬ諠・ｱ繧ｿ繝悶〒 `title` / `summary` / `coverAssetId` 繧貞酔譎らｷｨ髮・
    - 繧ｫ繝舌・逕ｻ蜒上・縲瑚・蛻・・逕ｻ蜒上い繧ｻ繝・ヨ縲阪∪縺溘・縲後♀豌励↓蜈･繧頑ｸ医∩逕ｻ蜒上い繧ｻ繝・ヨ縲阪°繧蛾∈謚・繧ｯ繝ｪ繧｢蜿ｯ閭ｽ・井ｿ晏ｭ倥∪縺ｧ繧ｲ繝ｼ繝譛ｬ菴薙∈譛ｪ蜿肴丐・・
    - 髻ｳ螢ｰ繧｢繧ｻ繝・ヨ縺ｯ驕ｸ謚樔ｸ榊庄・・AssetPicker type="image"`・・
    - 菫晏ｭ俶凾縺ｯ `title` / `summary` / `coverAssetId` / 蜷・ユ繝ｼ繝櫁ｨｭ螳壹ｒ蜷梧凾縺ｫ `PATCH /games/:id` 縺ｸ騾∽ｿ｡
    - 繝｡繝・そ繝ｼ繧ｸ繧ｦ繧｣繝ｳ繝峨え繧ｿ繝悶〒縺ｯ閭梧勹濶ｲ繝ｻ譫邱壹・隗剃ｸｸ繝ｻ菴咏區繝ｻ蜷榊燕蟶ｯ陦ｨ遉ｺ繝ｻ譁・ｭ苓牡繝ｻ譁・ｭ励し繧､繧ｺ繝ｻ陦碁俣繝ｻ繧ｿ繧､繝鈴溷ｺｦ繧堤ｷｨ髮・
  - 繝弱・繝臥ｷｨ髮・ｬ・〒縺ｯ縲碁幕蟋九ヮ繝ｼ繝峨↓險ｭ螳壹阪・繧ｿ繝ｳ縺ｧ繧ｷ繝ｼ繝ｳ縺ｮ `startNodeId` 繧呈峩譁ｰ
  - 繧ｷ繝ｼ繝ｳ荳隕ｧ縺ｧ縺ｯ縲後％縺ｮ繧ｷ繝ｼ繝ｳ縺九ｉ髢句ｧ九肴桃菴懊〒 `GameProject.startSceneId` 繧呈峩譁ｰ蜿ｯ閭ｽ
    - 蟇ｾ雎｡繧ｷ繝ｼ繝ｳ縺ｮ `startNodeId` 縺瑚ｨｭ螳壽ｸ医∩縺ｪ繧臥ｶｭ謖・
    - 譛ｪ險ｭ螳壹↑繧峨す繝ｼ繝ｳ蜀・・鬆ｭ繝弱・繝峨ｒ `startNodeId` 縺ｫ閾ｪ蜍戊ｨｭ螳・
    - 繝弱・繝・莉ｶ縺ｮ繧ｷ繝ｼ繝ｳ縺ｯ髢句ｧ九す繝ｼ繝ｳ縺ｫ險ｭ螳壹○縺壹√ヮ繝ｼ繝芽ｿｽ蜉繧呈｡亥・
  - 縲梧ｬ｡繝弱・繝峨阪・ **NodePicker・医Δ繝ｼ繝繝ｫ・区､懃ｴ｢繝ｻ蜀帝ｭ繝励Ξ繝薙Η繝ｼ莉倥″・・* 縺九ｉ驕ｸ謚・
    - 縲後す繝ｼ繝ｳ 竊・繝弱・繝峨堺ｺ梧ｮｵ髫朱∈謚朸I・亥ｷｦ繝壹う繝ｳ: 繧ｷ繝ｼ繝ｳ荳隕ｧ縲∝承繝壹う繝ｳ: 驕ｸ謚樔ｸｭ繧ｷ繝ｼ繝ｳ縺ｮ繝弱・繝我ｸ隕ｧ・・
    - 繧ｭ繝ｼ繝懊・繝画桃菴・ 讀懃ｴ｢谺・・譛溘ヵ繧ｩ繝ｼ繧ｫ繧ｹ繝ｻ蜿ｳ繝壹う繝ｳ縺ｧ `竊疏 / `竊伝 / `Enter` / `Esc` 謫堺ｽ懷庄閭ｽ
    - 隧ｳ邏ｰ繝励Ξ繝薙Η繝ｼ: 謇螻槭す繝ｼ繝ｳ繝ｻNode逡ｪ蜿ｷ繝ｻ譛ｬ譁・・繝ｬ繝薙Η繝ｼ繝ｻ驕ｸ謚櫁い謨ｰ繝ｻnextNode險ｭ螳壽怏辟｡繝ｻ髢句ｧ九ヮ繝ｼ繝芽｡ｨ遉ｺ
    - 讀懃ｴ｢譎ゅ・蜈ｨ繧ｷ繝ｼ繝ｳ讓ｪ譁ｭ讀懃ｴ｢縲∫樟蝨ｨ繧ｷ繝ｼ繝ｳ縺ｮ譛譁ｰ繝弱・繝牙渚譏縺ｨ莉悶す繝ｼ繝ｳ蛟呵｣懃ｶｭ謖√↓蟇ｾ蠢・

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue, apps/frontend/components/game/NodePicker.vue -->
#### 繧ｨ繝・ぅ繧ｿ縺ｮ繧ｭ繝ｼ繝懊・繝峨す繝ｧ繝ｼ繝医き繝・ヨ
- **Ctrl/竚・Enter**: 縲御ｿ晏ｭ倥＠縺ｦ谺｡縺ｮ繝弱・繝峨∈縲阪ｒ螳溯｡鯉ｼ井ｿ晏ｭ倪・譁ｰ隕丈ｽ懈・竊地extNodeId騾｣邨絶・驕ｷ遘ｻ縲～saving` 迥ｶ諷九〒騾｣謇馴亟豁｢・・
- **Ctrl/竚・K**: 谺｡繝弱・繝迂D谺・↓繝輔か繝ｼ繧ｫ繧ｹ荳ｭ縺ｫ NodePicker 繧貞叉襍ｷ蜍包ｼ域里蟄倥・驕ｸ謚槫・逅・→邨ｱ蜷茨ｼ・
- **F**: 繝励Ο繝代ユ繧｣繝壹う繝ｳ縺ｮ蜈ｨ逕ｻ髱｢竍秘壼ｸｸ陦ｨ遉ｺ繧貞・譖ｿ
- **Esc**: 蜈ｨ逕ｻ髱｢繝励Ο繝代ユ繧｣繝壹う繝ｳ繧帝哩縺倥ｋ

- **繝・せ繝医・繝ｬ繧､**: `/games/:id/play`
  - 繧ｯ繧ｨ繝ｪ `?sceneId=&nodeId=` 繧貞女縺大叙繧翫∵欠螳壹′縺ｪ縺・ｴ蜷医・ **scene.startNodeId 竊・蜈磯ｭ繝弱・繝・*縺ｮ鬆・〒閾ｪ蜍戊｣懷ｮ・
  - 蛻晏屓縺ｯ **髻ｳ螢ｰ蜷梧э繧ｪ繝ｼ繝舌・繝ｬ繧､**繧定｡ｨ遉ｺ縲ゅけ繝ｪ繝・け縺ｧ `AudioContext.resume()` 繧貞他縺ｳ蜃ｺ縺励。GM閾ｪ蜍募・逕溘ｒ隧ｦ縺ｿ繧具ｼ亥､ｱ謨玲凾縺ｯ谺｡縺ｮ謫堺ｽ懊〒蜀崎ｩｦ陦鯉ｼ・
  - **BGM繝輔ぉ繝ｼ繝窺VP・亥ｮ溯｣・ｸ医∩・・*
    - BGM蛛懈ｭ｢譎ゅ・蜊ｳ蛛懈ｭ｢縺帙★縲∝崋螳壽凾髢薙ヵ繧ｧ繝ｼ繝峨い繧ｦ繝亥ｾ後↓ `pause` / `src` 隗｣髯､ / `currentTime` 繝ｪ繧ｻ繝・ヨ繧定｡後≧
    - BGM蛻・崛譎ゅ・縲檎樟蝨ｨ譖ｲ繝輔ぉ繝ｼ繝峨い繧ｦ繝・竊・譁ｰ譖ｲ繧ｻ繝・ヨ 竊・譁ｰ譖ｲ繝輔ぉ繝ｼ繝峨う繝ｳ縲阪ｒ逶ｴ蛻励〒螳溯｡後☆繧具ｼ医け繝ｭ繧ｹ繝輔ぉ繝ｼ繝峨・譛ｪ螳溯｣・ｼ・
    - 蜷御ｸBGM・亥酔荳繝弱・繝蛾・遘ｻ縺ｧ `musicAssetId` 縺悟､牙喧縺励↑縺・こ繝ｼ繧ｹ・峨・蜀崎ｪｭ霎ｼ繝ｻ鬆ｭ蜃ｺ縺励・蜀阪ヵ繧ｧ繝ｼ繝峨ｒ陦後ｏ縺壼・逕溽ｶ咏ｶ・
    - 迴ｾ陦御ｻ墓ｧ倥→縺励※縲～musicAssetId` 譛ｪ謖・ｮ壹ヮ繝ｼ繝峨∈驕ｷ遘ｻ縺励◆蝣ｴ蜷医・BGM蛛懈ｭ｢謇ｱ縺・ｼ医ヵ繧ｧ繝ｼ繝峨い繧ｦ繝育ｵ檎罰・・
    - 繝輔ぉ繝ｼ繝牙・逅・・荳紋ｻ｣繝医・繧ｯ繝ｳ縺ｧ邂｡逅・＠縲、UTO / SKIP 縺ｮ鬮倬滄・遘ｻ荳ｭ縺ｧ繧ょ商縺・ヵ繧ｧ繝ｼ繝峨′譁ｰ縺励＞BGM髻ｳ驥上ｒ遐ｴ螢翫＠縺ｪ縺・
  - 繝弱・繝峨↓ `sfxAssetId` 縺瑚ｨｭ螳壹＆繧後※縺・ｋ蝣ｴ蜷医√◎縺ｮ繝弱・繝峨∈驕ｷ遘ｻ縺励◆繧ｿ繧､繝溘Φ繧ｰ縺ｧ蜉ｹ譫憺浹(SE)繧・蝗槫・逕溘☆繧・
  - SE縺ｯMVP縺ｨ縺励※譌｢蟄俶嫌蜍輔ｒ邯ｭ謖・ｼ・GM繝輔ぉ繝ｼ繝牙・逅・↓縺ｯ蟾ｻ縺崎ｾｼ縺ｾ縺ｪ縺・ｼ・
  - 蜉ｹ譫憺浹(SE)縺ｮ蜀咲函繧る浹螢ｰ蜷梧э(`audioConsent`)縺ｫ蠕薙≧縲・GM縺ｾ縺溘・蜉ｹ譫憺浹縺ｮ縺・★繧後°縺悟ｭ伜惠縺吶ｋ蝣ｴ蜷医・縲∝・蝗槭↓髻ｳ螢ｰ蜷梧э繧ｪ繝ｼ繝舌・繝ｬ繧､繧定｡ｨ遉ｺ縺吶ｋ
  - 繝輔Ν繧ｹ繧ｯ繝ｪ繝ｼ繝ｳ蛹悶＠縺ｦ繧ゅヮ繝ｼ繝臥憾諷九・邯ｭ謖√＆繧後ｋ
  - **繧ｫ繝｡繝ｩ・・oom/cx/cy・峨・ StageCanvas 縺ｫ蜿肴丐**縺輔ｌ縲∬レ譎ｯ縺ｨ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ縺ｫ諡｡螟ｧ繝ｻ繝代Φ螟画鋤繧帝←逕ｨ・医Γ繝・そ繝ｼ繧ｸ繧ｦ繧｣繝ｳ繝峨え縺ｯ諡｡螟ｧ縺励↑縺・ｼ・
  - **繧ｻ繝ｪ繝慕ｶ咏ｶ夊｡ｨ遉ｺ**: `continuesPreviousText` 縺・true 縺ｮ繝弱・繝峨〒縺ｯ縲∝燕繝弱・繝峨・繝・く繧ｹ繝医ｒ豸医＆縺壹↓谿九＠縲∫樟蝨ｨ縺ｮ繝弱・繝峨・繝・く繧ｹ繝医ｒ霑ｽ蜉陦ｨ遉ｺ縺吶ｋ縲る｣邯壹☆繧狗ｶ咏ｶ壹ヵ繝ｩ繧ｰ繧帝■縺｣縺ｦ邏ｯ遨崎｡ｨ遉ｺ縺吶ｋ・井ｼ夊ｩｱ縺ｮ豬√ｌ繧堤ｶｭ謖√＠縺溘∪縺ｾ貍泌・蜿ｯ閭ｽ・・
  - **AUTO / SKIP MVP・亥ｮ溯｣・ｸ医∩・・*
    - 繝｡繝・そ繝ｼ繧ｸ繧ｦ繧｣繝ｳ繝峨え縺ｮ繧ｯ繧､繝・け謫堺ｽ懷・縺ｫ `AUTO` / `SKIP` 繝懊ち繝ｳ繧定｡ｨ遉ｺ縺励・壼ｸｸ陦ｨ遉ｺ繝ｻ繝輔Ν繧ｹ繧ｯ繝ｪ繝ｼ繝ｳ陦ｨ遉ｺ縺ｮ荳｡譁ｹ縺ｧ蛻ｩ逕ｨ蜿ｯ閭ｽ
    - `AUTO`: 譛ｬ譁・・蜈ｨ譁・｡ｨ遉ｺ螳御ｺ・ｾ後∝崋螳壼ｾ・ｩ滓凾髢難ｼ育樟迥ｶ 1500ms・峨〒閾ｪ蜍暮ｲ陦・
    - `SKIP`: 繧ｿ繧､繝励Λ繧､繧ｿ繝ｼ繧貞叉蜈ｨ譁・｡ｨ遉ｺ縺励∫洒縺・崋螳夐俣髫費ｼ育樟迥ｶ 80ms・峨〒鬮倬滄ｲ陦・
    - `AUTO` 縺ｨ `SKIP` 縺ｯ謗剃ｻ悶ら援譁ｹ繧・ON 縺ｫ縺吶ｋ縺ｨ繧ゅ≧迚・婿縺ｯ OFF
    - 驕ｸ謚櫁い陦ｨ遉ｺ譎ゅ∫ｵらｫｯ繝弱・繝牙芦驕疲凾縲√そ繝ｼ繝・繝ｭ繝ｼ繝峨Δ繝ｼ繝繝ｫ陦ｨ遉ｺ譎ゅ√ヰ繝・け繝ｭ繧ｰ陦ｨ遉ｺ譎ゅ・浹螢ｰ蜷梧э繧ｪ繝ｼ繝舌・繝ｬ繧､陦ｨ遉ｺ譎ゅ・ AUTO / SKIP 繧貞●豁｢
    - 謇句虚騾ｲ陦鯉ｼ医け繝ｪ繝・け縲～Enter`縲～Space` 縺ｪ縺ｩ・峨ｒ陦後▲縺溷ｴ蜷医、UTO / SKIP 縺ｯ蛛懈ｭ｢
    - 譌｢隱ｭ邂｡逅・・譛ｪ螳溯｣・ゆｻ雁屓縺ｮ `SKIP` 縺ｯ譌｢隱ｭ/譛ｪ隱ｭ繧貞玄蛻･縺励↑縺・腰邏秘ｫ倬滄ｲ陦・
    - `SKIP` 縺ｯ騾｣邯・100 蝗樣ｲ陦後〒繝ｫ繝ｼ繝励ぎ繝ｼ繝峨ｒ逋ｺ轣ｫ縺励～Skip繧貞●豁｢縺励∪縺励◆縲ゅす繝翫Μ繧ｪ縺後Ν繝ｼ繝励＠縺ｦ縺・ｋ蜿ｯ閭ｽ諤ｧ縺後≠繧翫∪縺吶Ａ 繧帝夂衍縺励※蛛懈ｭ｢
  - **繧ｭ繝ｼ繝懊・繝画桃菴・*: 繧ｲ繝ｼ繝繝励Ξ繧､逕ｻ髱｢縺ｧ莉･荳九・繧ｭ繝ｼ謫堺ｽ懊′蜿ｯ閭ｽ・亥ｮ溯｣・ｸ医∩・・
    - `Enter` / `Space`: 繧ｿ繧､繝励Λ繧､繧ｿ繝ｼ荳ｭ縺ｯ蜈ｨ譁・｡ｨ遉ｺ縲∝ｮ御ｺ・ｾ後・谺｡縺ｮ繝弱・繝峨∈騾ｲ繧・磯∈謚櫁い陦ｨ遉ｺ荳ｭ縺ｯ繝上う繝ｩ繧､繝磯∈謚櫁い繧呈ｱｺ螳夲ｼ・
    - `竊疏 / `竊伝: 驕ｸ謚櫁い陦ｨ遉ｺ荳ｭ縺ｫ繝上う繝ｩ繧､繝育ｧｻ蜍包ｼ域忰蟆ｾ/蜈磯ｭ縺ｧ繝ｫ繝ｼ繝暦ｼ・
    - 謨ｰ蟄励く繝ｼ `1`縲彖9`: 蟇ｾ蠢懊☆繧狗分蜿ｷ縺ｮ驕ｸ謚櫁い繧堤峩謗･驕ｸ謚・
    - `Esc`: 繧ｻ繝ｼ繝・繝ｭ繝ｼ繝峨Δ繝ｼ繝繝ｫ 竊・繝舌ャ繧ｯ繝ｭ繧ｰ 竊・繝輔Ν繧ｹ繧ｯ繝ｪ繝ｼ繝ｳ縺ｮ蜆ｪ蜈磯・↓髢峨§繧・
    - `input` / `textarea` / `select` / `button` / `[contenteditable]` 繝輔か繝ｼ繧ｫ繧ｹ譎ゅ・繧ｷ繝ｧ繝ｼ繝医き繝・ヨ辟｡蜉ｹ
    - IME 螟画鋤荳ｭ・・event.isComposing` / `key === 'Process'`・峨・繧ｭ繝ｼ蜃ｦ逅・ｒ繧ｹ繧ｭ繝・・
    - 繧ｻ繝ｼ繝・繝ｭ繝ｼ繝峨Δ繝ｼ繝繝ｫ縺ｾ縺溘・繝舌ャ繧ｯ繝ｭ繧ｰ陦ｨ遉ｺ荳ｭ縺ｯ Esc 莉･螟悶〒繧ｲ繝ｼ繝騾ｲ陦後＠縺ｪ縺・
  - 蜃ｺ蜈ｸ: `apps/frontend/pages/games/[id]/play.vue`, `apps/frontend/components/game/MessageWindow.vue`

#### AUTO / SKIP 縺ｮ蟆・擂隱ｲ鬘・

- 譌｢隱ｭ邂｡逅・
- 譌｢隱ｭ驛ｨ蛻・□縺・Skip
- 譛ｪ隱ｭ繧ょ性繧√◆蠑ｷ蛻ｶ Skip
- Ctrl 髟ｷ謚ｼ縺・Skip
- Skip 騾溷ｺｦ險ｭ螳・
- Auto 蠕・ｩ滓凾髢楢ｨｭ螳・
- 繧ｭ繝ｼ繧ｳ繝ｳ繝輔ぅ繧ｰ
- 繝励Ξ繧､繝､繝ｼ縺斐→縺ｮ譌｢隱ｭ繝ｭ繧ｰ菫晏ｭ・
- Auto / Skip 縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ險ｭ螳壻ｿ晏ｭ・
- 繝｢繝舌う繝ｫ蜷代￠ Auto / Skip UI 譛驕ｩ蛹・
- 繝懊う繧ｹ蜀咲函邨ゆｺ・ｾ・■ Auto
- 譛ｪ隱ｭ蛻ｰ驕疲凾縺ｮ Skip 蛛懈ｭ｢
- 繧ｯ繝ｪ繝・け髟ｷ謚ｼ縺・/ 繧ｭ繝ｼ髟ｷ謚ｼ縺励↓繧医ｋ荳譎・Skip
- AUTO 荳ｭ縺ｮ驕ｸ謚櫁い閾ｪ蜍暮∈謚・

#### 繧ｹ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ / 繧ｯ繝ｬ繧ｸ繝・ヨ陦ｨ遉ｺ・亥ｰ・擂隱ｲ鬘鯉ｼ・

- 繧ｲ繝ｼ繝邨ゆｺ・凾縺ｫ繧ｹ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ繧・け繝ｬ繧ｸ繝・ヨ繧定｡ｨ遉ｺ縺吶ｋ
- 繧ｲ繝ｼ繝菴懆・・陦ｨ遉ｺ
- 菴ｿ逕ｨ繧｢繧ｻ繝・ヨ縺ｮ菴懆・｡ｨ遉ｺ・郁レ譎ｯ繝ｻBGM繝ｻSE繝ｻ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ邏譚舌↑縺ｩ蛻・｡橸ｼ・
- Special Thanks 縺ｪ縺ｩ縺ｮ閾ｪ逕ｱ險倩ｿｰ谺・
- 繧ｨ繝ｳ繝・ぅ繝ｳ繧ｰ繝弱・繝牙芦驕疲凾縺ｫ繧ｹ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ縺ｸ閾ｪ蜍暮・遘ｻ縺吶ｋ讖滓ｧ九・讀懆ｨ・
- 險ｭ險井ｸ翫・閠・・莠矩・
  - 繝ｦ繝ｼ繧ｶ繝ｼ陦ｨ遉ｺ蜷肴ｩ溯・縺悟ｿ・ｦ・
  - 繧｢繧ｻ繝・ヨ菴懆・｡ｨ遉ｺ縺悟ｿ・ｦ・
  - 菴ｿ逕ｨ繧｢繧ｻ繝・ヨ荳隕ｧ繧偵ご繝ｼ繝縺九ｉ髮・ｨ医〒縺阪ｋ蠢・ｦ√′縺ゅｋ
  - 蜑企勁貂医∩/髱槫・髢九い繧ｻ繝・ヨ縺ｮ繧ｯ繝ｬ繧ｸ繝・ヨ陦ｨ遉ｺ譁ｹ驥昴′蠢・ｦ・
  - 繧ｯ繝ｬ繧ｸ繝・ヨ陦ｨ遉ｺ險ｱ隲ｾ繧・｡ｨ遉ｺ蜷阪・謇ｱ縺・ｒ讀懆ｨ弱☆繧・
- 螳溯｣・━蜈亥ｺｦ: 荳ｻ隕√↑蛻ｶ菴懊・蜈ｬ髢九・繝励Ξ繧､讖溯・縺悟ｮ牙ｮ壹＠縺溷ｾ鯉ｼ・3 莉･髯搾ｼ・

### 繝峨Γ繧､繝ｳ / 繝｢繝・Ν(Prisma 豁｣)
- `GameProject { id, ownerId, title, summary?, viewCount Int, playCount Int, startSceneId String?, messageTheme Json?, deletedAt? ... }`
  - `startSceneId`: 繧ｲ繝ｼ繝蜈ｨ菴薙・髢句ｧ九す繝ｼ繝ｳID
  - `viewCount`: 蜈ｬ髢九ご繝ｼ繝隧ｳ邏ｰ陦ｨ遉ｺ縺ｮ邏ｯ險医き繧ｦ繝ｳ繝茨ｼ・VP・・
  - `playCount`: 蜈ｬ髢九ご繝ｼ繝繝励Ξ繧､髢句ｧ九・邏ｯ險医き繧ｦ繝ｳ繝茨ｼ・VP・・
  - `messageTheme`: 繝｡繝・そ繝ｼ繧ｸ繧ｦ繧｣繝ｳ繝峨え繝・・繝櫁ｨｭ螳夲ｼ亥ｾ瑚ｿｰ・・
- `GameScene { id, projectId(FK), name, order, startNodeId String?, createdAt, updatedAt }`
  - `startNodeId`: 繧ｷ繝ｼ繝ｳ髢句ｧ九ヮ繝ｼ繝迂D・医ご繝ｼ繝髢句ｧ区凾縺ｯ `GameProject.startSceneId` 縺ｮ繧ｷ繝ｼ繝ｳ縺ｫ縺ゅｋ `startNodeId` 繧剃ｽｿ逕ｨ・・
- `GameNode  { id, sceneId(FK), order, text, speakerCharacterId?, speakerDisplayName?, bgAssetId?, musicAssetId?, sfxAssetId?, portraits Json?, camera Json?, cameraFx Json?, continuesPreviousText Boolean?, createdAt, updatedAt }`
  - `continuesPreviousText`: 蜑阪ヮ繝ｼ繝峨・繧ｻ繝ｪ繝輔ｒ豸医＆縺壹↓邯咏ｶ夊｡ｨ遉ｺ縺吶ｋ繝輔Λ繧ｰ・育怐逡･譎・false・峨Ｕrue 縺ｮ蝣ｴ蜷医√％縺ｮ繝弱・繝峨・繝・く繧ｹ繝医ｒ蜑阪ヮ繝ｼ繝峨・繝・く繧ｹ繝医↓霑ｽ蜉縺励※陦ｨ遉ｺ縺吶ｋ縲ゅお繝・ぅ繧ｿ縺ｧ縺ｯ縲悟燕繝弱・繝峨・繧ｻ繝ｪ繝輔ｒ豸医＆縺壹↓邯壹￠繧九阪メ繧ｧ繝・け繝懊ャ繧ｯ繧ｹ縺ｧ險ｭ螳壹・
- `GameChoice { id, nodeId(FK), label, targetNodeId?, condition?, effects?, alternateTargetNodeId?, alternateCondition? }`
  - `targetNodeId` 譛ｪ險ｭ螳壹・ `null`・育ｩｺ譁・ｭ・`''` 縺ｯ譛ｪ菴ｿ逕ｨ・・

#### 髢句ｧ句慍轤ｹ繝｢繝・Ν縺ｮ蜀肴､懆ｨ手ｪｲ鬘・

- 迴ｾ迥ｶ縺ｮ繧ｲ繝ｼ繝髢句ｧ句慍轤ｹ縺ｯ `GameProject.startSceneId` 縺ｨ `GameScene.startNodeId` 縺ｮ邨・∩蜷医ｏ縺帙〒陦ｨ迴ｾ縺励※縺・ｋ
- 縺溘□縺鈴壼ｸｸ縺ｮ繧ｷ繝翫Μ繧ｪ驕ｷ遘ｻ縺ｯ `GameNode.nextNodeId` / `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` 縺ｫ繧医ｋ nodeId 逶ｴ謖・ｮ壹〒縺ゅｊ縲∫樟譎らせ縺ｧ縺ｯ縲後す繝ｼ繝ｳ縺ｸ遘ｻ蜍輔☆繧九肴ｩ溯・縺ｯ蟄伜惠縺励↑縺・
- 縺昴・縺溘ａ縲√ご繝ｼ繝髢句ｧ区凾縺ｫ譛ｬ雉ｪ逧・↓蠢・ｦ√↑縺ｮ縺ｯ髢句ｧ九ヮ繝ｼ繝迂D縺縺代〒縺ゅｊ縲・幕蟋九ヮ繝ｼ繝峨・謇螻槭す繝ｼ繝ｳ縺ｯ node 縺九ｉ騾・ｼ輔″縺ｧ縺阪ｋ
- 蟆・擂逧・↓縺ｯ `GameProject.startNodeId` 縺ｫ蜊倡ｴ泌喧縺吶ｋ菴吝慍縺後≠繧・
- 荳譁ｹ縺ｧ縲√す繝ｼ繝ｳ蜊倅ｽ阪ず繝｣繝ｳ繝励∫ｫ驕ｸ謚槭√す繝ｼ繝ｳ蜊倅ｽ阪ユ繧ｹ繝医・繝ｬ繧､縲√ヵ繝ｭ繝ｼ繝√Ε繝ｼ繝郁｡ｨ遉ｺ繧貞ｮ溯｣・☆繧九↑繧・`GameScene.startNodeId` 縺ｯ諢丞袖繧呈戟縺､
- 迴ｾ譎らせ縺ｧ縺ｯ譌｢蟄伜ｮ溯｣・ｒ邯ｭ謖√＠縲√％縺ｮ轤ｹ縺ｯ蟆・擂縺ｮ險ｭ險郁ｪｲ鬘後→縺励※謇ｱ縺・
- 莉雁ｾ後す繝ｼ繝ｳ蜊倅ｽ阪ず繝｣繝ｳ繝励ｒ螳溯｣・＠縺ｪ縺・婿驥昴′蝗ｺ縺ｾ繧九↑繧峨～GameProject.startNodeId` 縺ｸ縺ｮ遘ｻ陦後ｒ蜀肴､懆ｨ弱☆繧・

#### Node.camera JSON
```ts
type Camera = { zoom: number /*100窶・00*/; cx: number /*0窶・00*/; cy: number /*0窶・00*/ }
// 譌｢螳・ { zoom:100, cx:50, cy:50 }・茨ｼ・・繧ｹ繝・・繧ｸ蝓ｺ貅厄ｼ・
```

#### Node.cameraFx JSON・医き繝｡繝ｩ貍泌・・・

```ts
type Camera = { zoom: number; cx: number; cy: number }

type CameraPoint = {
  zoom?: number  // 100窶・00 (%)
  cx?: number   // 0窶・00 (%)
  cy?: number   // 0窶・00 (%)
}

type CameraFxMode = 'cut' | 'together' | 'pan-then-zoom' | 'zoom-then-pan'

type GameNodeCameraFx = {
  from?: CameraPoint    // 繝弱・繝蛾幕蟋区凾縺ｮ繧ｫ繝｡繝ｩ・育怐逡･譎ゅ・蜑阪ヮ繝ｼ繝峨・ camera 縺ｾ縺溘・迴ｾ蝨ｨ繧ｫ繝｡繝ｩ・・
  to?: CameraPoint      // 繝弱・繝臥ｵゆｺ・凾縺ｮ繧ｫ繝｡繝ｩ・育怐逡･譎ゅ・縺薙・繝弱・繝峨・ camera・・
  durationMs?: number   // 繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ譎る俣(ms)縲・ 莉･荳・or 譛ｪ謖・ｮ壹〒縺ｯ繧｢繝九Γ縺ｪ縺・
  mode?: CameraFxMode   // 繧｢繝九Γ縺ｮ鬆・ｺ上ら怐逡･譎・'together'
}
```

* 繝・せ繝医・繝ｬ繧､縺ｧ縺ｯ縲√ヮ繝ｼ繝峨↓蜈･縺｣縺溘ち繧､繝溘Φ繧ｰ縺ｧ莉･荳九・繝ｫ繝ｼ繝ｫ縺ｧ繧ｫ繝｡繝ｩ繧呈ｱｺ螳壹＠縲～StageCanvas` 縺ｫ蜿肴丐縺吶ｋ:
  * 髢句ｧ九き繝｡繝ｩ:
    * `cameraFx.from` 縺後≠繧後・縺昴ｌ繧剃ｽｿ縺・ｼ井ｸ崎ｶｳ繝励Ο繝代ユ繧｣縺ｯ蜑阪ヮ繝ｼ繝峨・ camera 繧定｣懷ｮ鯉ｼ・
    * 縺ｪ縺代ｌ縺ｰ蜑阪ヮ繝ｼ繝峨・ camera・亥・鬆ｭ繝弱・繝峨〒縺ｯ `{zoom:100,cx:50,cy:50}`・・
  * 邨ゆｺ・き繝｡繝ｩ:
    * `cameraFx.to` 縺後≠繧後・縺昴ｌ繧剃ｽｿ縺・ｼ井ｸ崎ｶｳ繝励Ο繝代ユ繧｣縺ｯ縺薙・繝弱・繝峨・ camera 繧定｣懷ｮ鯉ｼ・
    * 縺ｪ縺代ｌ縺ｰ縺薙・繝弱・繝峨・ `camera`

* `mode` / `durationMs` 縺ｫ蠢懊§縺ｦ縲√ぜ繝ｼ繝縺ｨ繝代Φ繧・`requestAnimationFrame` 縺ｧ陬憺俣縺励※蜍輔°縺吶・
* `cameraFx` 縺梧悴險ｭ螳壹～mode: "cut"`縲～durationMs <= 0` 縺ｮ蝣ｴ蜷医・縲∝ｾ捺擂縺ｩ縺翫ｊ繧ｫ繝・ヨ蛻・崛縲・

窶ｻ UI 縺ｧ縺ｯ蠖馴擇縲’rom/to 縺ｮ隧ｳ邏ｰ邱ｨ髮・・陦後ｏ縺壹√悟燕繝弱・繝・竊・縺薙・繝弱・繝峨阪・繝代ち繝ｼ繝ｳ縺ｫ蟇ｾ縺吶ｋ繝｢繝ｼ繝峨→譎る俣繧呈欠螳壹☆繧狗ｰ｡譏・UI 繧呈署萓帙☆繧九・

**繧ｨ繝・ぅ繧ｿ縺ｧ縺ｮ險ｭ螳・*:
- 縲後き繝｡繝ｩ貍泌・縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｧ譛牙柑/辟｡蜉ｹ繧偵メ繧ｧ繝・け繝懊ャ繧ｯ繧ｹ縺ｧ蛻・ｊ譖ｿ縺・
- 繝｢繝ｼ繝蛾∈謚・ 縲後ぜ繝ｼ繝・九ヱ繝ｳ蜷梧凾縲阪後ヱ繝ｳ 竊・繧ｺ繝ｼ繝縲阪後ぜ繝ｼ繝 竊・繝代Φ縲阪後き繝・ヨ蛻・崛縲・
- 繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ譎る俣・・s・峨ｒ謨ｰ蛟､蜈･蜉幢ｼ・莉･荳九∪縺溘・譛ｪ險ｭ螳壹〒繧｢繝九Γ縺ｪ縺暦ｼ・
- 騾壼ｸｸ陦ｨ遉ｺ繝ｻ蜈ｨ逕ｻ髱｢陦ｨ遉ｺ縺ｮ荳｡譁ｹ縺ｧ險ｭ螳壼庄閭ｽ

#### Node.portraits JSON・郁､・焚・・
```ts
type Portrait = {
  characterId: string
  imageId: string
  thumb?: string
  x: number /*0窶・00*/      // ・・ 蟾ｦ荳・0,0) 窶・蜿ｳ荳・100,100)
  y: number /*0窶・00*/      // ・・ 遶九■菴咲ｽｮ縲・iniStage 蛛ｴ縺ｧ translate(-50%,-100%)
  scale?: number /*%*/     // 繧ｹ繝・・繧ｸ鬮倥＆縺ｫ蟇ｾ縺吶ｋ・・・iniStage 縺ｯ >60 繧・1/3 縺ｫ霑台ｼｼ・・50竊・0・・
  z?: number               // 蜑榊ｾ碁未菫ゅょ､ｧ縺阪＞縺ｻ縺ｩ謇句燕
}
```

### 繧｢繧ｻ繝・ヨ縺ｮ謇ｱ縺・
- 逕ｻ蜒・髻ｳ螢ｰ縺ｯ **逶ｴ繝ｪ繝ｳ繧ｯ遖∵ｭ｢**縲ょｿ・★ `/uploads/signed-get?key=...` 繧堤ｵ檎罰縺励※蜿門ｾ暦ｼ・TL 螟ｱ蜉ｹ譎ゅ・蜀咲ｽｲ蜷搾ｼ峨・
- 繝輔Ο繝ｳ繝医・ `useAssetMeta().signedFromId()` 繧貞茜逕ｨ縲・
- 蜿門ｾ・UI:
  - AssetPicker: 縲瑚・蛻・・繧｢繧ｻ繝・ヨ / 縺頑ｰ励↓蜈･繧翫阪ち繝・+ 讀懃ｴ｢
  - CharacterPicker 竊・CharacterImagePicker: 繧ｭ繝｣繝ｩ竊偵◎縺ｮ逕ｻ蜒上ｒ谿ｵ髫朱∈謚・

### 繝｡繝・そ繝ｼ繧ｸ繧ｦ繧｣繝ｳ繝峨え・亥・菴楢ｨｭ螳夲ｼ・
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, apps/frontend/utils/themeUtils.ts -->
`MessageThemeModal.vue` 縺ｧ螳夂ｾｩ縺輔ｌ繧句・騾壹ユ繝ｼ繝槭ゆｿ晏ｭ倥・ `PATCH /games/:id` 縺ｫ `{ messageTheme }` 繧帝∽ｿ｡縲・

#### 繧ｲ繝ｼ繝蜈ｨ菴楢ｨｭ螳夲ｼ亥渕譛ｬ諠・ｱMVP・・
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, apps/frontend/pages/my/games/[id]/edit.vue -->
- `/my/games/:id/edit` 荳企Κ縺ｮ蟶ｸ譎ゅヵ繧ｩ繝ｼ繝縺ｯ蟒・ｭ｢縺励√ご繝ｼ繝蝓ｺ譛ｬ諠・ｱ縺ｯ縲悟・菴楢ｨｭ螳壹阪Δ繝ｼ繝繝ｫ蜀・・ `蝓ｺ譛ｬ諠・ｱ` 繧ｿ繝悶〒邱ｨ髮・☆繧九・
- 蜈ｨ菴楢ｨｭ螳壹Δ繝ｼ繝繝ｫ縺ｯ縲後ご繝ｼ繝蜈ｨ菴楢ｨｭ螳壹阪→縺励※縲～title` / `summary` 縺ｨ繝励Ξ繧､逕ｻ髱｢UI險ｭ螳夲ｼ・essageTheme / gameUiTheme / backlogTheme・峨ｒ荳菴薙〒謇ｱ縺・・
- 蝓ｺ譛ｬ諠・ｱMVP縺ｮ蟇ｾ雎｡縺ｯ `title` / `summary` 縺ｮ縺ｿ縲・
- 蟆・擂諡｡蠑ｵ蛟呵｣・ `coverAssetId` / 繧ｿ繧ｰ / 繧ｸ繝｣繝ｳ繝ｫ / 豕ｨ諢乗嶌縺・/ slug 縺ｪ縺ｩ繧貞渕譛ｬ諠・ｱ繧ｿ繝悶∪縺溘・蜻ｨ霎ｺ險ｭ螳壹∈霑ｽ蜉讀懆ｨ弱・

#### v2・医・繝ｪ繧ｻ繝・ヨ荳ｭ蠢・・譁ｰ莉墓ｧ假ｼ・
<!-- impl: packages/types/src/index.ts (MessageThemeV2, RGBA, FONT_K 遲峨・螳壽焚), apps/frontend/utils/themeUtils.ts (resolveThemeV2, migrateToV2) -->
v2 縺ｧ縺ｯ px 逶ｴ謖・ｮ壹°繧峨・縲・0谿ｵ髫弱・繝励Μ繧ｻ繝・ヨ縲堺ｸｭ蠢・∈遘ｻ陦後り牡縺ｯRGBA蟇ｾ蠢懊よ里蟄倥ョ繝ｼ繧ｿ縺ｯ閾ｪ蜍輔〒繝励Μ繧ｻ繝・ヨ縺ｸ荳ｸ繧∬ｾｼ縺ｿ縲・

```ts
interface MessageThemeV2 {
  themeVersion: 2;
  
  // 譌｢蟄假ｼ育ｶ咏ｶ夲ｼ・
  rows?: 1|2|3|4|5|6;          // 陦ｨ遉ｺ陦梧焚・域里螳・・・
  scale?: 'sm'|'md'|'lg';       // 繧ｦ繧｣繝ｳ繝峨え繧ｵ繧､繧ｺ・域里螳嗄d縲∽ｺ呈鋤逕ｨ・・
  
  // 譁ｰ繝励Μ繧ｻ繝・ヨ・・縲・0・・
  fontPreset?: 1|...|10;        // 譁・ｭ励し繧､繧ｺ 譌｢螳・
  windowPreset?: 1|...|10;      // 繧ｦ繧｣繝ｳ繝峨え繧ｵ繧､繧ｺ 譌｢螳・・・d逶ｸ蠖難ｼ・
  paddingPreset?: 1|...|10;     // 蜀・・菴咏區 譌｢螳・
  radiusPreset?: 1|...|10;      // 隗剃ｸｸ 譌｢螳・
  borderPreset?: 1|...|10;      // 譫邱壼､ｪ縺・譌｢螳・
  shadowPreset?: 1|...|10;      // 蠖ｱ蠑ｷ蠎ｦ 譌｢螳・
  typeSpeedPreset?: 1|...|10;   // 繧ｿ繧､繝鈴溷ｺｦ 譌｢螳・・・=繧・▲縺上ｊ縲・0=鬮倬滂ｼ・
  
  // 濶ｲ・・GBA or HEX string・・
  frameBg?: RGBA | string;      // 繝｡繝・そ繝ｼ繧ｸ譫閭梧勹
  frameBorder?: RGBA | string;  // 譫邱夊牡
  nameBg?: RGBA | string;       // 蜷榊燕閭梧勹濶ｲ
  textColor?: RGBA | string;    // 譁・ｭ苓牡
  
  // 繧ｰ繝ｩ繝・・繧ｷ繝ｧ繝ｳ
  gradientDirection?: 'none'|'to-b'|'to-t'|'to-r'|'to-l';  // 繧ｰ繝ｩ繝・・繧ｷ繝ｧ繝ｳ譁ｹ蜷托ｼ域里螳・'none'・・
  gradientColor?: RGBA | string;  // 繧ｰ繝ｩ繝・・繧ｷ繝ｧ繝ｳ邨らせ濶ｲ・域婿蜷代′'none'莉･螟悶・蝣ｴ蜷医↓菴ｿ逕ｨ・・
  
  // 繝輔か繝ｳ繝医せ繧ｿ繧､繝ｫ
  fontWeight?: 'normal'|'bold';   // 繝輔か繝ｳ繝亥､ｪ縺包ｼ域里螳・'normal'・・
  fontStyle?: 'normal'|'italic';  // 繝輔か繝ｳ繝医せ繧ｿ繧､繝ｫ・域里螳・'normal'・・
  
  // 譌ｧ蛟､・・allback逕ｨ縲」1莠呈鋤・・
  frame?: {...};
  name?: {...};
  text?: {...};
  typewriter?: {...};
}

interface RGBA {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a: number;  // 0-1
}
```

**繝励Μ繧ｻ繝・ヨ繝・・繝悶Ν・亥ｮ壽焚・・*:
<!-- impl: packages/types/src/index.ts -->

| 繝励Μ繧ｻ繝・ヨ | 鬆・岼 | 蛟､・・ndex 1..10・・| 諢丞袖 |
|---|---|---|---|
| `FONT_K` | 譁・ｭ励し繧､繧ｺ蛟咲紫 | [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.08, 1.16, 1.25, 1.35, 1.48] | 蝓ｺ貅・6px ﾃ・菫よ焚・域里螳・ = 1.00・・|
| `PADDING_K` | 蜀・・菴咏區蛟咲紫 | [0, 0.70, 0.80, 0.90, 0.95, 1.00, 1.10, 1.20, 1.30, 1.40, 1.55] | 蝓ｺ貅・6px ﾃ・菫よ焚・域里螳・ = 1.00・・|
| `RADIUS_PX` | 隗剃ｸｸ・・x・・| [0, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24] | 邨ｶ蟇ｾ蛟､・域里螳・ = 12px・・|
| `BORDER_PX` | 譫邱壼､ｪ縺包ｼ・x・・| [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10] | 邨ｶ蟇ｾ蛟､・域里螳・ = 2px・・|
| `TYPE_MS` | 繧ｿ繧､繝鈴溷ｺｦ・・s/譁・ｭ暦ｼ・| [0, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15] | 1=繧・▲縺上ｊ縲・0=鬮倬滂ｼ域里螳・ = 35ms・・|
| `WINDOW_PRESET` | 繧ｦ繧｣繝ｳ繝峨え繧ｵ繧､繧ｺ | 蜷・`{ w, h, mb, mw }` | 1=蟆・84%), 6=讓呎ｺ・92%, md), 10=螟ｧ(98%) |
| `SHADOW_PRESET` | 蠖ｱ蠑ｷ蠎ｦ | [0, 'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] | Tailwind蠖ｱ繧ｯ繝ｩ繧ｹ・域里螳・ = 'md'・・|

**繝輔か繝ｳ繝医せ繧ｱ繝ｼ繝ｫ縺ｮ譬ｹ諡**:
<!-- impl: apps/frontend/composables/useStageScale.ts, apps/frontend/components/game/MessageWindow.vue -->
- 繧ｹ繝・・繧ｸ縺ｮ螳滄ｫ倥＆px (`--stage-h-px`) 繧貞渕貅悶↓ `clamp()` 縺ｧ繝輔か繝ｳ繝医し繧､繧ｺ繧堤ｮ怜・・・
  - `font-size: clamp(12px, calc(16px * fontK * var(--stage-scale, 1)), 28px)`
  - `--stage-scale = var(--stage-h-px) / 720` ・・20px繧貞渕貅厄ｼ・
- 騾壼ｸｸ陦ｨ遉ｺ繝ｻ蜈ｨ逕ｻ髱｢繝ｻ繝・せ繝医・繝ｬ繧､縺ｧ**蜷御ｸ縺ｮ繝舌Λ繝ｳ繧ｹ**縺ｧ隕九∴繧九ｈ縺・ｨｭ險・

**陦梧焚縺ｨ繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ謚第ｭ｢**:
<!-- impl: apps/frontend/components/game/MessageWindow.vue -->
- `rows` 縺ｧ陦ｨ遉ｺ陦梧焚・・縲・・峨ｒ謖・ｮ壹ゅΓ繝・そ繝ｼ繧ｸ譛ｬ譁・・ `-webkit-line-clamp` / `line-clamp` 縺ｧ蝗ｺ螳夐ｫ倥＆縺ｫ蛻ｶ髯舌＠縲・*繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ遖∵ｭ｢**

**濶ｲ蜈･蜉帙→繝励Ξ繝薙Η繝ｼ**:
<!-- impl: apps/frontend/components/game/MessageThemeModal.vue, ColorField.vue -->
- ColorField 繧ｳ繝ｳ繝昴・繝阪Φ繝医〒 RGB+Alpha 繝斐ャ繧ｫ繝ｼ縲？EX蜈･蜉幢ｼ・RRGGBB・峨ヽGBA譁・ｭ怜・蜈･蜉帙√・繝ｪ繧ｻ繝・ヨ繝代Ξ繝・ヨ繧呈署萓・
- 繧ｳ繝ｳ繝医Λ繧ｹ繝域ｯ費ｼ・CAG蝓ｺ貅厄ｼ峨ｒ險育ｮ励＠縲・明蛟､・・.5:1/3.0:1・峨ｒ荳句屓繧九→隴ｦ蜻願｡ｨ遉ｺ

**莠呈鋤諤ｧ**:
- 譌ｧ繝・・繧ｿ・・1・峨・隱ｭ縺ｿ霎ｼ縺ｿ譎ゅ↓ `migrateToV2()` 縺ｧ閾ｪ蜍募､画鋤
- px蛟､縺九ｉ譛蟇・ｊ繝励Μ繧ｻ繝・ヨ縺ｸ荳ｸ繧・ｼ井ｾ・ 譁・ｭ・6px 竊・fontPreset=5・・
- 菫晏ｭ俶凾縺ｫ `themeVersion: 2` 繧剃ｻ倅ｸ・

**荳顔ｴ夊ｨｭ螳・*:
- 謚倥ｊ逡ｳ縺ｿ縺ｧ px 逶ｴ謗･蜈･蜉帙ｂ蜿ｯ閭ｽ・井ｸ企剞蛟､縺ｨ縺励※蜍穂ｽ懊∫判髱｢繧ｵ繧､繧ｺ縺ｫ蠢懊§縺ｦ閾ｪ蜍戊ｪｿ謨ｴ・・

**蜃ｺ蜈ｸ**:
- 蝙句ｮ夂ｾｩ: `packages/types/src/index.ts` ・・MessageThemeV2`, `RGBA`, 繝励Μ繧ｻ繝・ヨ螳壽焚・・
- 邱ｨ髮・I: `apps/frontend/components/game/MessageThemeModal.vue`
- 繝ｦ繝ｼ繝・ぅ繝ｪ繝・ぅ: `apps/frontend/utils/themeUtils.ts` ・亥､画鋤繝ｻ繧ｳ繝ｳ繝医Λ繧ｹ繝郁ｨ育ｮ暦ｼ・
- 謠冗判: `apps/frontend/components/game/MessageWindow.vue`, `apps/frontend/components/game/StageCanvas.vue`

<!-- impl: apps/frontend/components/game/MessageThemeModal.vue -->
**菫晏ｭ伜・逅・・蝣・欧蛹・*:
- `$api` 縺ｯ髢｢謨ｰ蜀・〒蜿門ｾ暦ｼ・useNuxtApp()` 繧痴ave髢｢謨ｰ蜀・〒蜻ｼ縺ｳ蜃ｺ縺暦ｼ峨＠縺ｦSSR蝠城｡後ｒ蝗樣∩
- `saving` ref 縺ｧ菫晏ｭ倅ｸｭ迥ｶ諷九ｒ邂｡逅・＠縲√・繧ｿ繝ｳ繧堤┌蜉ｹ蛹厄ｼ磯｣謇馴亟豁｢・・
- 繧ｨ繝ｩ繝ｼ譎ゑｼ唏TTP繧ｹ繝・・繧ｿ繧ｹ縺ｨ繝｡繝・そ繝ｼ繧ｸ繧偵ヨ繝ｼ繧ｹ繝医〒隧ｳ邏ｰ陦ｨ遉ｺ・井ｾ・ `菫晏ｭ倥お繝ｩ繝ｼ (400): 繝輔ぅ繝ｼ繝ｫ繝峨′荳肴ｭ｣縺ｧ縺兪・・
- 謌仙粥譎ゑｼ啻saved` 繧､繝吶Φ繝医〒隕ｪ縺ｫ `messageTheme` 繧貞叉譎ょ渚譏縺励√・繝ｬ繝薙Η繝ｼ繧呈峩譁ｰ

**API莉墓ｧ・*:
<!-- impl: apps/api/src/games/games.controller.ts, apps/api/src/games/games.service.ts -->
- **繧ｨ繝ｳ繝峨・繧､繝ｳ繝・*: `PATCH /games/:id`
- **繝ｪ繧ｯ繧ｨ繧ｹ繝医・繝・ぅ**: `{ messageTheme: MessageThemeV2, themeVersion?: 2 }`
- **繝ｬ繧ｹ繝昴Φ繧ｹ**: 譖ｴ譁ｰ蠕後・繧ｲ繝ｼ繝繧ｪ繝悶ず繧ｧ繧ｯ繝茨ｼ・messageTheme` 繧貞性繧・・
- **隱榊庄**: SupabaseAuthGuard・域園譛芽・・縺ｿ・・
- **繝舌Μ繝・・繧ｷ繝ｧ繝ｳ**: JSON蝙九→縺励※蜿礼炊縲∬牡繝輔ぅ繝ｼ繝ｫ繝峨・RGBA/HEX譁・ｭ怜・繧定ｨｱ螳ｹ

#### v1・域立莉墓ｧ倥∽ｺ呈鋤邯ｭ謖・ｼ・
```ts
interface MessageTheme {
  frame: { bg: string; borderColor: string; borderWidth: number; radius: number; padding: number };
  name: { show: boolean; bg: string; color: string; padding: number; radius: number };
  text: { color: string; size: number; lineHeight: number; fontPreset?: 1|...|10; rows?: 1|...|6 };
  typewriter: { msPerChar: number };
  scale?: 'sm'|'md'|'lg';
}
```

繝励Ξ繝薙Η繝ｼ縺ｯ **StageCanvas** 荳翫〒 `MessageWindow` 繧帝㍾縺ｭ縺ｦ遒ｺ隱阪る壼ｸｸ繝ｻ蜈ｨ逕ｻ髱｢繝ｻ繝・せ繝医・繝ｬ繧､縺・★繧後〒繧ょ酔荳豈皮紫縺ｧ陦ｨ遉ｺ縲・

### 繧ｨ繝・ぅ繧ｿ謫堺ｽ・蜿ｳ繝壹う繝ｳ)
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 蜿ｰ隧橸ｼ・ext・・
- 隧ｱ閠・く繝｣繝ｩ・・peakerCharacterId・峨→ **隧ｱ閠・｡ｨ險假ｼ郁・逕ｱ蜈･蜉幢ｼ・* 窶ｦ蛹ｿ蜷肴ｼ泌・・・???` 遲会ｼ峨ｄ縺ゅ□蜷阪↓蟇ｾ蠢・
- 閭梧勹・・gAssetId・・窶ｦ 繧ｵ繝繝崎｡ｨ遉ｺ
- BGM・・usicAssetId・・窶ｦ `<audio controls>` 縺ｧ蜀咲函/蛛懈ｭ｢蜿ｯ
- 蜉ｹ譫憺浹・・E, sfxAssetId・・窶ｦ 繧ｨ繝・ぅ繧ｿ荳翫・繝ｩ繝吶Ν縺ｯ縲悟柑譫憺浹(SE)縲阪Ａ<audio controls>` 縺ｧ隧ｦ閨ｴ蜿ｯ
- **繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ驟咲ｽｮ・・ortraits[]・・* 窶ｦ 隍・焚陦後ょ推陦後〒逕ｻ蜒丞､画峩 / 蜑企勁 / `x,y,scale,z` 繧貞句挨隱ｿ謨ｴ

#### 蜿ｳ繝壹う繝ｳ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ蛹邦VP・・026-05-02 螳溯｣・ｼ・
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 繝弱・繝臥ｷｨ髮・ｬ・ｒ谺｡縺ｮ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｫ蛻・牡縺励∝推隕句・縺励ｒ繧ｯ繝ｪ繝・け縺ｧ髢矩哩蜿ｯ閭ｽ縺ｫ縺励◆
  - 蝓ｺ譛ｬ諠・ｱ
  - 陦ｨ遉ｺ繝ｻ邏譚・
  - 貍泌・
  - 驕ｷ遘ｻ繝ｻ蛻・ｲ・
  - 繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け
  - 蜊ｱ髯ｺ謫堺ｽ・
- 騾壼ｸｸ陦ｨ遉ｺ縺縺代〒縺ｪ縺上√ヮ繝ｼ繝牙・逕ｻ髱｢陦ｨ遉ｺ・・繧ｫ繝ｩ繝蜿ｳ繝輔か繝ｼ繝・峨↓繧ょ酔遲峨・繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ蛻・｡槭→髢矩哩謖吝虚繧貞渚譏縺励◆
- 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ髢矩哩迥ｶ諷九・ `sectionOpen` 縺ｧ邂｡逅・☆繧具ｼ亥・譛溷､: 蝓ｺ譛ｬ諠・ｱ/陦ｨ遉ｺ繝ｻ邏譚・驕ｷ遘ｻ繝ｻ蛻・ｲ・繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け縺ｯ髢九∵ｼ泌・/蜊ｱ髯ｺ謫堺ｽ懊・髢会ｼ・
- 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ髢矩哩迥ｶ諷九・ LocalStorage 縺ｫ豌ｸ邯壼喧縺吶ｋ
  - 繧ｭ繝ｼ: `talking.editor.rightPaneSections.v1`・育樟迥ｶ縺ｯ蜈ｨ繧ｲ繝ｼ繝蜈ｱ騾壹ゅご繝ｼ繝ID蛻･菫晏ｭ倥・蟆・擂讀懆ｨ趣ｼ・
  - 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ髢矩哩譎ゅ↓菫晏ｭ倥＠縲√・繝ｼ繧ｸ蜀崎｡ｨ遉ｺ譎ゅ↓蠕ｩ蜈・☆繧・
  - 菫晏ｭ伜､縺悟｣翫ｌ縺ｦ縺・ｋ蝣ｴ蜷医・譌｢螳壼､縺ｸ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縺吶ｋ
  - 菫晏ｭ伜､縺ｫ谺縺代※縺・ｋ繧ｭ繝ｼ縺ｯ譌｢螳壼､縺ｧ陬懷ｮ後☆繧具ｼ亥ｰ・擂繧ｭ繝ｼ霑ｽ蜉譎ゅ・莠呈鋤繧堤｢ｺ菫晢ｼ・
  - 騾壼ｸｸ陦ｨ遉ｺ縺ｨ蜈ｨ逕ｻ髱｢陦ｨ遉ｺ縺ｯ蜷後§ `sectionOpen` 迥ｶ諷九ｒ蜈ｱ譛峨☆繧・
- 譛蠕後↓驕ｸ謚槭＠縺滉ｽ懈･ｭ菴咲ｽｮ・医す繝ｼ繝ｳ/繝弱・繝会ｼ峨ｒ LocalStorage 縺ｫ豌ｸ邯壼喧縺吶ｋ
  - 繧ｭ繝ｼ: `talking.editor.lastSelection.v1:${gameId}`・医ご繝ｼ繝縺斐→縺ｫ蛻・屬・・
  - 繧ｷ繝ｼ繝ｳ驕ｸ謚樊凾縺ｫ `sceneId` 繧剃ｿ晏ｭ倥＠縲√ヮ繝ｼ繝画悴驕ｸ謚樒憾諷九→縺励※ `nodeId` 縺ｯ `null` 縺ｧ菫晏ｭ倥☆繧・
  - 繝弱・繝蛾∈謚樊凾縺ｫ `sceneId` 縺ｨ `nodeId` 繧剃ｿ晏ｭ倥☆繧・
  - 菫晏ｭ俶凾縺ｫ `updatedAt`・・imestamp・峨ｒ莉倅ｸ弱☆繧・
  - 蠕ｩ蜈・凾縺ｯ菫晏ｭ俶ｸ医∩ `sceneId` / `nodeId` 繧呈､懆ｨｼ縺励∝ｭ伜惠縺吶ｋ蟇ｾ雎｡縺ｮ縺ｿ驕ｩ逕ｨ縺吶ｋ
  - 菫晏ｭ俶ｸ医∩ `nodeId` 縺悟挨繧ｷ繝ｼ繝ｳ謇螻槭・蝣ｴ蜷医∬ｩｲ蠖薙ヮ繝ｼ繝峨′隕九▽縺九▲縺溘す繝ｼ繝ｳ繧貞━蜈医＠縺ｦ蠕ｩ蜈・☆繧・
  - 菫晏ｭ俶ｸ医∩ scene/node 縺悟炎髯､貂医∩縺ｪ縺ｩ縺ｧ荳肴ｭ｣縺ｪ蝣ｴ蜷医・譌｢蟄伜・譛溽憾諷九∈繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縺励∝商縺・ｿ晏ｭ伜､縺ｯ蜑企勁縺ｾ縺溘・迴ｾ蝨ｨ迥ｶ諷九〒荳頑嶌縺阪☆繧・
  - 菫晏ｭ伜､縺後↑縺・ｴ蜷医・蠕ｩ蜈・↓螟ｱ謨励＠縺溷ｴ蜷医・縲～GameProject.startSceneId` 縺ｮ繧ｷ繝ｼ繝ｳ・域悴險ｭ螳壹↑繧牙・鬆ｭ繧ｷ繝ｼ繝ｳ・俄・ 縺昴・繧ｷ繝ｼ繝ｳ縺ｮ `startNodeId`・域悴險ｭ螳壹↑繧牙・鬆ｭ繝弱・繝会ｼ峨・鬆・〒蛻晄悄驕ｸ謚槭☆繧・
  - JSON 繝代・繧ｹ螟ｱ謨玲凾繝ｻsceneId/nodeId 縺御ｸ肴ｭ｣繝ｻ菫晏ｭ俶ｸ医∩ sceneId 縺悟ｭ伜惠縺励↑縺・ｴ蜷医・ localStorage 縺ｮ蜿､縺・､繧貞炎髯､縺励※縺九ｉ蛻晄悄驕ｸ謚槭∈繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縺吶ｋ
  - 蜿ｳ繝壹う繝ｳ髢矩哩迥ｶ諷具ｼ・talking.editor.rightPaneSections.v1`・峨→縺ｯ蛻･繧ｭ繝ｼ縺ｧ邂｡逅・＠縲∽ｺ偵＞縺ｫ蟷ｲ貂峨＠縺ｪ縺・
- 蜷・・蜉帙ヶ繝ｭ繝・け縺ｮ陦ｨ遉ｺ蛻ｶ蠕｡縺ｯ `v-if` 縺ｧ陦後＞縲∵里蟄倥・邱ｨ髮・・菫晏ｭ倥・蜑企勁繝ｻ驕ｸ謚櫁い邱ｨ髮・ｩ溯・縺ｯ邯ｭ謖√☆繧・
- 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺励→謚倥ｊ縺溘◆縺ｿ遽・峇縺ｮ荳堺ｸ閾ｴ繧剃ｿｮ豁｣縺励√瑚ｦ句・縺励・逶ｴ荳九↓縺ゅｋ鬆・岼縲阪′縺昴・隕句・縺励・髢矩哩迥ｶ諷九↓蠕薙≧繧医≧謨ｴ逅・＠縺・
- 騾壼ｸｸ陦ｨ遉ｺ縺ｨ蜈ｨ逕ｻ髱｢陦ｨ遉ｺ縺ｧ縲∝推鬆・岼縺ｮ謇螻槭き繝・ざ繝ｪ・亥渕譛ｬ諠・ｱ / 陦ｨ遉ｺ繝ｻ邏譚・/ 貍泌・ / 驕ｷ遘ｻ繝ｻ蛻・ｲ・/ 蜊ｱ髯ｺ謫堺ｽ懶ｼ峨ｒ荳閾ｴ縺輔○縺・
- `繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け` 縺ｯ蜿ｳ繝壹う繝ｳ荳企Κ縺ｮ蟆ら畑繝代ロ繝ｫ縺ｨ縺励※驟咲ｽｮ縺励《everity 繝輔ぅ繝ｫ繧ｿ莉倥″縺ｧ謚倥ｊ縺溘◆縺ｿ蜿ｯ閭ｽ・磯壼ｸｸ陦ｨ遉ｺ/蜈ｨ逕ｻ髱｢陦ｨ遉ｺ縺ｮ邱ｨ髮・ヵ繝ｭ繝ｼ縺九ｉ蛻ｩ逕ｨ蜿ｯ閭ｽ・・
- `陦ｨ遉ｺ繝ｻ邏譚秦 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｫ縺ｯ `繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ驟咲ｽｮ` 繧帝・鄂ｮ縺吶ｋ
- `貍泌・` 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｫ縺ｯ `繧ｫ繝｡繝ｩ` / `繧ｫ繝｡繝ｩ貍泌・` / `繝薙ず繝･繧｢繝ｫ繧ｨ繝輔ぉ繧ｯ繝・ / `繧ｫ繝ｩ繝ｼ繝輔ぅ繝ｫ繧ｿ繝ｼ` 繧帝・鄂ｮ縺吶ｋ
- `驕ｷ遘ｻ繝ｻ蛻・ｲ秦 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｫ縺ｯ `谺｡繝弱・繝迂D`縲～谺｡繝弱・繝我ｽ懈・譎ゅ・繧ｳ繝斐・蟇ｾ雎｡`縲～驕ｸ謚櫁い` 繧貞性繧√ｋ
- `蜊ｱ髯ｺ謫堺ｽ彖 繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｫ縺ｯ繝弱・繝牙炎髯､蟆守ｷ壹ｒ驟咲ｽｮ縺吶ｋ
- 莉雁屓縺ｯ繝輔か繝ｼ繝蜈ｱ騾壹さ繝ｳ繝昴・繝阪Φ繝亥喧縺ｾ縺ｧ縺ｯ陦後ｏ縺壹・壼ｸｸ陦ｨ遉ｺ/蜈ｨ逕ｻ髱｢陦ｨ遉ｺ縺ｮ繝輔か繝ｼ繝驥崎､・・蟆・擂隱ｲ鬘後→縺励※謇ｱ縺・

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
#### 谺｡繝弱・繝峨・險ｭ螳・
- 谺｡繝弱・繝迂D谺・・繝輔か繝ｼ繧ｫ繧ｹ蜿ｯ閭ｽ・・tabindex="0"`・峨〒縲√け繝ｪ繝・け縺ｾ縺溘・ **Ctrl/竚・K** 縺ｧ **NodePicker** 繧定ｵｷ蜍・
- NodePicker 縺ｯ蜈ｨ繧ｷ繝ｼ繝ｳ繝ｻ蜈ｨ繝弱・繝峨°繧画､懃ｴ｢蜿ｯ閭ｽ縺ｧ縲ヾcene逡ｪ蜿ｷ/#繝弱・繝臥分蜿ｷ/蜿ｰ隧槫・鬆ｭ・・0譁・ｭ暦ｼ峨ｒ陦ｨ遉ｺ
- 驕ｸ謚槫ｾ後・ `nodeDraft.nextNodeId` 縺ｫ蜿肴丐縺励√Δ繝ｼ繝繝ｫ繧帝哩縺倥ｋ

#### 蜑企勁蟆守ｷ壹→蜿ら・謨ｴ蜷茨ｼ育樟迥ｶ・・
- **繝弱・繝牙炎髯､MVP縺ｯ螳溯｣・ｸ医∩**・・wner 髯仙ｮ壹∝ｭ伜惠縺励↑縺・ｯｾ雎｡縺ｯ 404縲・撼owner縺ｯ 403・・
- **繧ｷ繝ｼ繝ｳ蜑企勁MVP縺ｯ螳溯｣・ｸ医∩**・・wner 髯仙ｮ壹∝ｭ伜惠縺励↑縺・ｯｾ雎｡縺ｯ 404縲・撼owner縺ｯ 403縲∵怙蠕後・1繧ｷ繝ｼ繝ｳ縺ｯ蜑企勁荳榊庄・・
- **繧ｲ繝ｼ繝蜑企勁蟆守ｷ壹・螳溯｣・ｸ医∩**・・/my/games` 縺九ｉ蜑企勁遒ｺ隱堺ｻ倥″縺ｧ soft delete 蜿ｯ閭ｽ・・
  - 蜑企勁貂医∩繧ｲ繝ｼ繝縺ｯ `/my/games` / `/games` / `/games/:id` / `/games/:id/play` / `/my/games/:id/edit` 縺九ｉ隕九∴縺ｪ縺・
  - 螳悟・蜑企勁繝ｻpurge 縺ｯ蟆・擂隱ｲ鬘後→縺励※谿九☆
- 蜑企勁蜑咲｢ｺ隱阪ム繧､繧｢繝ｭ繧ｰ縺ｨ蜿ら・莉ｶ謨ｰ陦ｨ遉ｺ縺ｯ螳溯｣・ｸ医∩
  - 繝弱・繝・ 髢句ｧ九ヮ繝ｼ繝牙盾辣ｧ / nextNode蜿ら・ / choice驕ｷ遘ｻ蜈亥盾辣ｧ
  - 繧ｷ繝ｼ繝ｳ: 蜑企勁縺輔ｌ繧九ヮ繝ｼ繝画焚 / 繧ｷ繝ｼ繝ｳ蜀・ヮ繝ｼ繝峨∈縺ｮ螟夜Κ蜿ら・莉ｶ謨ｰ
- 繝弱・繝牙炎髯､繝ｻ繧ｷ繝ｼ繝ｳ蜑企勁譎ゅ・蜿ら・隗｣髯､繧呈・遉ｺ螳溯｡後☆繧・
  - `GameScene.startNodeId`
  - `GameNode.nextNodeId`
  - `GameChoice.targetNodeId`
  - `GameChoice.alternateTargetNodeId`
  - ・医す繝ｼ繝ｳ蜑企勁譎ゑｼ荏GameProject.startSceneId`
- `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` 縺ｯ蜿ら・隗｣髯､譎ゅ↓ `null` 繧定ｨｭ螳壹☆繧・
- 譌｢蟄倥・ `targetNodeId = ''` 繝・・繧ｿ縺ｯ migration 縺ｧ `null` 縺ｫ遘ｻ陦後☆繧・

#### 繧ｲ繝ｼ繝隍・｣ｽMVP・・026-05-04 螳溯｣・ｼ・
<!-- impl: apps/api/src/games/games.controller.ts, apps/api/src/games/games.service.ts, apps/frontend/composables/useGames.ts, apps/frontend/pages/my/games/index.vue -->
- API: `POST /games/:id/duplicate` 繧定ｿｽ蜉・郁ｦ√Ο繧ｰ繧､繝ｳ・・
- owner 譛ｬ莠ｺ縺ｮ縺ｿ隍・｣ｽ蜿ｯ閭ｽ
  - 莉紋ｺｺ縺ｮ繧ｲ繝ｼ繝: `403`
  - 蜑企勁貂医∩繧ｲ繝ｼ繝: `404`
- 隍・｣ｽ蟇ｾ雎｡
  - `GameProject`: `title`, `summary`, `coverAssetId`, `messageTheme`, `gameUiTheme`, `backlogTheme`
  - `GameScene`: `name`, `order`, `startNodeId`
  - `GameNode`: 迴ｾ陦後ヮ繝ｼ繝芽ｨｭ螳壻ｸ蠑擾ｼ域悽譁・隧ｱ閠・邏譚仙盾辣ｧ/貍泌・/繧ｫ繝｡繝ｩ/蛻・ｲ宣未騾｣・・
  - `GameChoice`: `label`, `targetNodeId`, `condition`, `effects`, `alternateTargetNodeId`, `alternateCondition`
- ID蜀阪・繝・ヴ繝ｳ繧ｰ
  - 譌ｧ `sceneId` 竊・譁ｰ `sceneId`
  - 譌ｧ `nodeId` 竊・譁ｰ `nodeId`
  - `GameProject.startSceneId` / `GameScene.startNodeId` / `GameNode.nextNodeId` / `GameChoice.targetNodeId` / `GameChoice.alternateTargetNodeId` 繧呈眠ID縺ｸ螟画鋤
  - 螢翫ｌ縺溷盾辣ｧ繧・悴險ｭ螳壹・ `null` 縺ｫ螳牙・蛹・
- 隍・｣ｽ譎ゅ↓蠑輔″邯吶′縺ｪ縺・ｂ縺ｮ
  - 蜈ｬ髢狗憾諷具ｼ郁､・｣ｽ蜈医・蟶ｸ縺ｫ `isPublic = false`・・
  - `viewCount` / `playCount`・郁､・｣ｽ蜈医・ `0`・・
  - 繧ｻ繝ｼ繝悶ョ繝ｼ繧ｿ縲√・繝ｬ繧､螻･豁ｴ縲√♀豌励↓蜈･繧顔ｭ峨・蜻ｨ霎ｺ繝・・繧ｿ
  - 繧｢繧ｻ繝・ヨ螳滉ｽ難ｼ育ｴ譚蝕D蜿ら・縺ｯ蠑輔″邯吶℃・・
- 繧ｿ繧､繝医Ν縺ｯ `蜈・ち繧､繝医Ν 縺ｮ繧ｳ繝斐・` 繧貞渕譛ｬ縺ｨ縺励・㍾隍・凾縺ｯ `蜈・ち繧､繝医Ν 縺ｮ繧ｳ繝斐・ 2` 縺ｮ繧医≧縺ｫ謗｡逡ｪ
- 螳溯｣・・DB繝医Λ繝ｳ繧ｶ繧ｯ繧ｷ繝ｧ繝ｳ縺ｧ陦後＞縲・比ｸｭ螟ｱ謨玲凾縺ｫ荳ｭ騾泌濠遶ｯ縺ｪ隍・｣ｽ繝・・繧ｿ繧呈ｮ九＆縺ｪ縺・
- UI: `/my/games` 縺ｮ蜷・き繝ｼ繝峨↓縲後ご繝ｼ繝繧定､・｣ｽ縲阪・繧ｿ繝ｳ繧定ｿｽ蜉
  - 螳溯｡悟燕縺ｫ遒ｺ隱阪ム繧､繧｢繝ｭ繧ｰ陦ｨ遉ｺ
  - 謌仙粥譎ゅ・荳隕ｧ繧貞・蜿門ｾ励＠縲∬､・｣ｽ蜈・D縺悟叙蠕励〒縺阪◆蝣ｴ蜷医・ `/my/games/:newId/edit` 縺ｸ驕ｷ遘ｻ
  - 螟ｱ謨玲凾縺ｯ繝医・繧ｹ繝医〒繧ｨ繝ｩ繝ｼ陦ｨ遉ｺ

#### 繧ｲ繝ｼ繝蝓ｺ譛ｬ諠・ｱ邱ｨ髮・VP・・026-05-04 螳溯｣・ｼ・
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue, apps/api/src/games/games.service.ts, apps/api/src/games/dto/update-game.dto.ts -->
- 邱ｨ髮・判髱｢ `/my/games/:id/edit` 縺ｮ荳企Κ縺ｫ縲√ご繝ｼ繝蝓ｺ譛ｬ諠・ｱ・・title`, `summary`・峨・邱ｨ髮・I繧定ｿｽ蜉
  - 迴ｾ蝨ｨ蛟､繧貞・譛溯｡ｨ遉ｺ縺励∽ｿ晏ｭ伜ｾ後・逕ｻ髱｢荳企Κ繧ｿ繧､繝医Ν陦ｨ遉ｺ・・game.title`・峨ｂ蜊ｳ譎よ峩譁ｰ
  - 菫晏ｭ倥・繧ｿ繝ｳ縺ｯ縲梧悴螟画峩縲阪御ｿ晏ｭ倅ｸｭ縲阪後ヰ繝ｪ繝・・繧ｷ繝ｧ繝ｳ繧ｨ繝ｩ繝ｼ縲阪〒辟｡蜉ｹ蛹悶＠縲∽ｺ碁㍾騾∽ｿ｡繧帝亟豁｢
  - 謌仙粥譎ゅ・繝医・繧ｹ繝磯夂衍縲∝､ｱ謨玲凾縺ｯ繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ陦ｨ遉ｺ
- 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ・・VP・・
  - `title`: 蠢・医∫ｩｺ譁・ｭ励・遨ｺ逋ｽ縺ｮ縺ｿ荳榊庄縲∵怙螟ｧ120譁・ｭ・
  - `summary`: 莉ｻ諢上∫ｩｺ蜿ｯ縲∵怙螟ｧ500譁・ｭ・
  - 繝輔Ο繝ｳ繝医→API縺ｮ荳｡譁ｹ縺ｧ荳願ｨ倥ｒ諡・ｿ・
- API譖ｴ譁ｰ莉墓ｧ假ｼ・PATCH /games/:id`・・
  - owner 譛ｬ莠ｺ縺ｮ縺ｿ譖ｴ譁ｰ蜿ｯ閭ｽ・磯撼owner縺ｯ `403`・・
  - 蜑企勁貂医∩繧ｲ繝ｼ繝縺ｯ譖ｴ譁ｰ荳榊庄・・404`・・
  - `title` / `summary` 譖ｴ譁ｰ縺ｮ縺ｿ縺ｧ縺ｯ蜈ｬ髢句燕繝√ぉ繝・け繧貞・螳溯｡後＠縺ｪ縺・
  - 蜈ｬ髢句燕繝√ぉ繝・け縺ｯ蠕捺擂縺ｩ縺翫ｊ `isPublic: true` 繧呈・遉ｺ縺励◆譖ｴ譁ｰ譎ゅ・縺ｿ螳溯｡・
- 蜈ｬ髢区ｸ医∩繧ｲ繝ｼ繝縺ｮ `title` / `summary` 譖ｴ譁ｰ縺ｯ險ｱ蜿ｯ縺励～/games` 荳隕ｧ繝ｻ`/games/:id` 隧ｳ邏ｰ縺ｫ縺ｯ譖ｴ譁ｰ蜀・ｮｹ縺後◎縺ｮ縺ｾ縺ｾ蜿肴丐縺輔ｌ繧・
- `coverAssetId` 縺ｯ縲後ご繝ｼ繝蜈ｨ菴楢ｨｭ螳・> 蝓ｺ譛ｬ諠・ｱ縲阪ち繝悶〒邱ｨ髮・庄閭ｽ・育判蜒上い繧ｻ繝・ヨ縺ｮ縺ｿ縲り・蛻・・逕ｻ蜒上∪縺溘・縺頑ｰ励↓蜈･繧頑ｸ医∩逕ｻ蜒上ｒ驕ｸ謚・繧ｯ繝ｪ繧｢蟇ｾ蠢懶ｼ・

#### 驕ｸ謚櫁い縺ｨ騾壼ｸｸ驕ｷ遘ｻ蜈医・蜆ｪ蜈磯・ｽ搾ｼ・026-05-02 譖ｴ譁ｰ・・
- `choice.targetNodeId !== null` 縺ｮ驕ｸ謚櫁い縺ｮ縺ｿ縲瑚｡ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縲阪→縺吶ｋ
- 陦ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺・莉ｶ莉･荳翫≠繧句ｴ蜷医√・繝ｬ繧､譎ゅ・驕ｸ謚櫁い繧定｡ｨ遉ｺ縺励～nextNodeId` 縺ｯ菴ｿ逕ｨ縺励↑縺・
- 陦ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺・莉ｶ縺ｮ蝣ｴ蜷医・縺ｿ縲～nextNodeId` 縺後≠繧後・騾壼ｸｸ騾ｲ陦後☆繧・
- `nextNodeId` 繧ゅ↑縺・ｴ蜷医・邨ゆｺ・桶縺・↓縺吶ｋ
- `targetNodeId = null` 縺ｮ驕ｸ謚櫁い縺ｯ邱ｨ髮・判髱｢縺ｧ隴ｦ蜻願｡ｨ遉ｺ縺励√・繝ｬ繧､逕ｻ髱｢縺ｧ縺ｯ陦ｨ遉ｺ縺励↑縺・ｼ・VP・・
- 邱ｨ髮・判髱｢縺ｧ `nextNodeId` 縺ｨ陦ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺悟酔譎りｨｭ螳壹・蝣ｴ蜷医・豕ｨ諢乗枚繧定｡ｨ遉ｺ縺吶ｋ

#### 繧ｷ繝翫Μ繧ｪ繝√ぉ繝・けMVP・・026-05-02 螳溯｣・ｼ・
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 邱ｨ髮・判髱｢蜿ｳ繝壹う繝ｳ荳企Κ縺ｫ縲後す繝翫Μ繧ｪ繝√ぉ繝・け縲阪ヱ繝阪Ν繧定ｿｽ蜉・域釜繧翫◆縺溘∩蜿ｯ・・
- 邨先棡繧・`error` / `warning` / `info` 縺ｮ3蛻・｡槭〒荳隕ｧ陦ｨ遉ｺ
- 莉ｶ謨ｰ繧ｵ繝槭Μ・医お繝ｩ繝ｼn莉ｶ繝ｻ隴ｦ蜻穫莉ｶ繝ｻ諠・ｱn莉ｶ・峨ｒ陦ｨ遉ｺ
- 蜷・・岼縺ｫ髢｢騾｣繧ｷ繝ｼ繝ｳ/繝弱・繝画ュ蝣ｱ繧定｡ｨ遉ｺ縺励∝庄閭ｽ縺ｪ鬆・岼縺ｯ縲悟ｯｾ雎｡縺ｸ遘ｻ蜍輔阪〒隧ｲ蠖薙す繝ｼ繝ｳ/繝弱・繝峨∈繧ｸ繝｣繝ｳ繝怜庄閭ｽ
- 0莉ｶ譎ゅ・縲悟撫鬘後・隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲阪ｒ陦ｨ遉ｺ

#### 繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け陦ｨ遉ｺ謾ｹ蝟・ｼ・026-05-02 霑ｽ陬懶ｼ・
<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue -->
- 邨先棡荳隕ｧ縺ｮ陦ｨ遉ｺ鬆・ｒ `error 竊・warning 竊・info` 縺ｫ邨ｱ荳
- severity 繝輔ぅ繝ｫ繧ｿ・・縺吶∋縺ｦ / 繧ｨ繝ｩ繝ｼ / 隴ｦ蜻・/ 諠・ｱ`・峨ｒ霑ｽ蜉縺励∝推繝輔ぅ繝ｫ繧ｿ縺ｫ莉ｶ謨ｰ繧定｡ｨ遉ｺ
- 繝輔ぅ繝ｫ繧ｿ蠕後・0莉ｶ譎ゅ・縲後％縺ｮ譚｡莉ｶ縺ｮ繝√ぉ繝・け鬆・岼縺ｯ縺ゅｊ縺ｾ縺帙ｓ縲ゅ阪ｒ陦ｨ遉ｺ
- 諠・ｱ・・nfo・峨・驟崎牡繧呈而縺医ａ縺ｫ縺励～縺吶∋縺ｦ` 陦ｨ遉ｺ譎ゅ・諠・ｱ鄒､繧呈釜繧翫◆縺溘∩蜿ｯ閭ｽ縺ｫ縺励※縲√お繝ｩ繝ｼ/隴ｦ蜻翫ｒ蜈医↓遒ｺ隱阪＠繧・☆縺上＠縺・
- 莉ｶ謨ｰ繧ｵ繝槭Μ縺ｯ繧ｨ繝ｩ繝ｼ繧呈怙繧ら岼遶九▽隕九◆逶ｮ縺ｫ縺励∬ｭｦ蜻翫ｒ谺｡轤ｹ縲∵ュ蝣ｱ繧呈而縺医ａ縺ｫ陦ｨ遉ｺ
- 譌｢蟄倥・縲悟ｯｾ雎｡縺ｸ遘ｻ蜍輔榊虚邱壹・邯ｭ謖√＠縲√ヵ繧｣繝ｫ繧ｿ蠕後・荳隕ｧ縺九ｉ繧ょｾ捺擂縺ｩ縺翫ｊ繧ｸ繝｣繝ｳ繝怜庄閭ｽ

#### 蜈ｬ髢句燕繝√ぉ繝・けMVP・・026-05-03 螳溯｣・ｼ・
<!-- impl: apps/frontend/pages/my/games/index.vue, apps/frontend/utils/scenarioCheck.ts, apps/frontend/pages/my/games/[id]/edit.vue, apps/api/src/games/games.service.ts -->
- `/my/games` 縺九ｉ縺ｮ蜈ｬ髢句・譖ｿ・磯撼蜈ｬ髢銀・蜈ｬ髢具ｼ画凾縺ｫ縲∝・髢句燕繝√ぉ繝・け繧貞ｮ溯｡後☆繧・
- 繝√ぉ繝・け蛻､螳壹・ edit逕ｻ髱｢縺ｮ繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け縺ｨ蜷御ｸ繝ｭ繧ｸ繝・け繧貞・騾壼喧縺励◆ `runScenarioCheck` 繧貞茜逕ｨ縺吶ｋ
- 蛻､螳壹Ν繝ｼ繝ｫ
  - `error` 縺・莉ｶ莉･荳・ 蜈ｬ髢倶ｸ榊庄・亥・髢狗憾諷九・螟画峩縺励↑縺・ｼ・
  - `warning` 縺ｮ縺ｿ: 遒ｺ隱阪ム繧､繧｢繝ｭ繧ｰ謇ｿ隱榊ｾ後↓蜈ｬ髢句庄
  - `info` 縺ｮ縺ｿ / 蝠城｡後↑縺・ 蜈ｬ髢句庄
- `error` 譎ゅ・UI
  - 繧ｨ繝ｩ繝ｼ莉ｶ謨ｰ繧定｡ｨ遉ｺ
  - 繧ｨ繝ｩ繝ｼ蜀・ｮｹ・亥・鬆ｭ3莉ｶ・峨ｒ陦ｨ遉ｺ
  - 縲後す繝翫Μ繧ｪ繝√ぉ繝・け繧堤｢ｺ隱阪榊ｰ守ｷ壹→縺励※ edit逕ｻ髱｢縺ｸ驕ｷ遘ｻ蜿ｯ閭ｽ
  - 驕ｷ遘ｻ譎ゅ↓ `focusScenarioCheck=1&scenarioCheckFilter=error` 繧剃ｻ倅ｸ弱＠縲√す繝翫Μ繧ｪ繝√ぉ繝・け繝代ロ繝ｫ螻暮幕縺ｨ繧ｨ繝ｩ繝ｼ繝輔ぅ繝ｫ繧ｿ蛻晄悄陦ｨ遉ｺ繧定｡後≧
- `/my/games` 縺ｧ縺ｮ髱槫・髢句喧・亥・髢銀・髱槫・髢具ｼ峨・蠕捺擂縺ｩ縺翫ｊ蟶ｸ縺ｫ險ｱ蜿ｯ
- API蛛ｴ縺ｮ蜈ｬ髢区凾繝√ぉ繝・け・域怙邨る亟陦帷ｷ夲ｼ峨ｒ霑ｽ蜉
  - `PATCH /games/:id` 縺ｧ `isPublic: true` 縺後Μ繧ｯ繧ｨ繧ｹ繝医↓蜷ｫ縺ｾ繧後ｋ蝣ｴ蜷医・縺ｿ縲√し繝ｼ繝舌・蛛ｴ縺ｧ譛菴朱剞縺ｮ `error` 繝√ぉ繝・け繧貞ｮ滓命
  - `error` 縺・莉ｶ莉･荳翫↑繧・400 縺ｧ蜈ｬ髢区拠蜷ｦ・・message` 縺ｨ `errors` 繧定ｿ斐☆・・
  - `warning` / `info` 逶ｸ蠖薙・鬆・岼縺ｯ API 縺ｧ縺ｯ蜈ｬ髢区拠蜷ｦ縺励↑縺・
  - `isPublic: false` 縺ｮ髱槫・髢句喧縺ｯ蟶ｸ縺ｫ險ｱ蜿ｯ
  - `isPublic` 譛ｪ謖・ｮ壹・譖ｴ譁ｰ縺ｯ蠕捺擂縺ｩ縺翫ｊ險ｱ蜿ｯ
- 蠖ｹ蜑ｲ蛻・球
  - 繝輔Ο繝ｳ繝亥・蜈ｬ髢句燕繝√ぉ繝・け: 繝ｦ繝ｼ繧ｶ繝ｼ蜷代￠縺ｮ莠句燕譯亥・・・arning遒ｺ隱阪∽ｿｮ豁｣蟆守ｷ夲ｼ・
  - API蛛ｴ蜈ｬ髢句燕繝√ぉ繝・け: 蜈ｬ髢狗憾諷区紛蜷医ｒ螳医ｋ譛邨る亟陦帷ｷ・

#### 蜈ｬ髢句燕繝√ぉ繝・けMVP縺ｮ遒ｺ隱咲ｵ先棡・・026-05-03・・
- 螳溯｡後さ繝槭Φ繝・
  - `pnpm -w build`: 螟ｱ謨暦ｼ・xit 1・・
    - `apps/api prisma:generate` 縺ｧ `query_engine-windows.dll.node` rename 譎ゅ↓ `EPERM`・医ヵ繧｡繧､繝ｫ繝ｭ繝・け・・
  - `pnpm -C apps/frontend test`: 謌仙粥・・ files / 10 tests passed・・
  - API test 繧ｳ繝槭Φ繝・ `apps/api/package.json` 縺ｫ test script 縺後↑縺・◆繧∵悴螳溯｡・
- 譛ｪ螳溯｡檎｢ｺ隱・
  - 繝悶Λ繧ｦ繧ｶ謇句虚E2E・・rror/warning/info 縺ｮ蜷・憾諷九〒縺ｮ蜈ｬ髢句ｰ守ｷ壹・螳滓桃菴懶ｼ峨・譛ｪ螳滓命
  - 逅・罰: 縺薙・螳溯｡檎腸蠅・〒縺ｯ繝悶Λ繧ｦ繧ｶ謇句虚讀懆ｨｼ繧貞ｮ溯｡後＠縺ｦ縺・↑縺・◆繧・

讀懷・鬆・岼:
- 髢句ｧ玖ｨｭ螳壻ｸ榊ｙ
  - `GameProject.startSceneId` 譛ｪ險ｭ螳・蜿ら・蛻・ｌ
  - 髢句ｧ九す繝ｼ繝ｳ縺ｮ `startNodeId` 譛ｪ險ｭ螳・蜿ら・蛻・ｌ
  - 髢句ｧ九す繝ｼ繝ｳ縺檎ｩｺ・医ヮ繝ｼ繝・莉ｶ・・
- 蟄伜惠縺励↑縺・盾辣ｧ
  - `GameNode.nextNodeId`
  - `GameChoice.targetNodeId`
  - `GameChoice.alternateTargetNodeId`
- 譛ｪ險ｭ螳夐∈謚櫁い
  - `GameChoice.targetNodeId === null`・・arning・・
- 驕ｸ謚櫁い縺ｨ `nextNodeId` 縺ｮ菴ｵ逕ｨ豕ｨ諢・
  - 陦ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺・莉ｶ莉･荳翫≠繧翫√°縺､ `nextNodeId` 繧りｨｭ螳壹＆繧後※縺・ｋ繝弱・繝会ｼ・nfo・・
- 蛻ｰ驕比ｸ崎・繝弱・繝・
  - 髢句ｧ九ヮ繝ｼ繝峨°繧牙芦驕斐〒縺阪↑縺・ヮ繝ｼ繝会ｼ・arning・・
- 遨ｺ繧ｷ繝ｼ繝ｳ
  - 繝弱・繝・莉ｶ縺ｮ繧ｷ繝ｼ繝ｳ・・arning・・
- 邨らｫｯ繝弱・繝・
  - 蛻ｰ驕泌庄閭ｽ繝弱・繝峨・縺・■縲∬｡ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い0莉ｶ縺九▽ `nextNodeId` 縺ｪ縺暦ｼ・nfo・・

蛻ｰ驕泌庄閭ｽ諤ｧ縺ｮ險育ｮ励Ν繝ｼ繝ｫ:
- 蟋狗せ縺ｯ `GameProject.startSceneId` 縺ｮ繧ｷ繝ｼ繝ｳ縺ｫ縺ゅｋ `startNodeId`
- 繝弱・繝蛾・遘ｻ
  - 陦ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺・莉ｶ莉･荳翫≠繧句ｴ蜷・
    - `choice.targetNodeId` 繧貞呵｣懊↓蜷ｫ繧√ｋ
    - `choice.alternateTargetNodeId` 繧ゅ悟芦驕斐＠縺・ｋ蛟呵｣懊阪→縺励※蜷ｫ繧√ｋ
    - 縺薙・縺ｨ縺・`nextNodeId` 縺ｯ騾壼ｸｸ驕ｷ遘ｻ縺ｨ縺励※菴ｿ繧上↑縺・
  - 陦ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺・莉ｶ縺ｮ蝣ｴ蜷・
    - `nextNodeId` 縺後≠繧後・驕ｷ遘ｻ
    - 縺ｪ縺代ｌ縺ｰ邨らｫｯ
- 蟄伜惠縺励↑縺・盾辣ｧ縺ｯ蛻ｰ驕碑ｨ育ｮ励〒縺ｯ辟｡隕悶＠縲∝挨騾斐お繝ｩ繝ｼ縺ｨ縺励※蝣ｱ蜻・
- 螟画焚譚｡莉ｶ・・condition` / `alternateCondition`・峨・蜴ｳ蟇・ｩ穂ｾ｡縺ｯMVP縺ｧ縺ｯ陦後ｏ縺ｪ縺・

蟆・擂隱ｲ鬘・
- 螟画焚譚｡莉ｶ縺ｮ蜴ｳ蟇・ｩ穂ｾ｡繧貞性繧蛻ｰ驕泌庄閭ｽ諤ｧ蛻､螳・
- 繝輔Ο繝ｼ繝√Ε繝ｼ繝亥庄隕門喧

#### 蜈ｬ髢句燕繝√ぉ繝・けUI繧ｫ繝・ざ繝ｪ蛻・￠MVP・・026-05-04 螳溯｣・ｼ・
<!-- impl: apps/frontend/utils/scenarioCheck.ts, apps/frontend/pages/my/games/[id]/edit.vue, apps/frontend/pages/my/games/index.vue -->
- 邱ｨ髮・判髱｢縺ｮ縲後す繝翫Μ繧ｪ繝√ぉ繝・け縲肴ｬ・ｒ縲悟・髢句燕繝√ぉ繝・け縲阪↓謾ｹ遘ｰ
- 陬懆ｶｳ譁・ｒ霑ｽ蜉: 縲後ご繝ｼ繝讒区・繝ｻ邏譚仙盾辣ｧ繝ｻ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ蜿ら・繧堤｢ｺ隱阪＠縺ｾ縺吶りｭｦ蜻翫・蜈ｬ髢九ｒ繝悶Ο繝・け縺励∪縺帙ｓ縲ゅ・
- issue繧偵ヵ繝ｭ繝ｳ繝亥・縺ｧ3繧ｫ繝・ざ繝ｪ縺ｫ蛻・｡橸ｼ・PI縺ｯ螟画峩縺ｪ縺暦ｼ・
  - `structure`: `runScenarioCheck` 逕ｱ譚･縺ｮ讒区・繝√ぉ繝・け蜈ｨ闊ｬ
  - `asset-reference`: `reference-diagnostics` 逕ｱ譚･縺ｮ縺・■ `ASSET_*` 繧ｳ繝ｼ繝峨∪縺溘・ asset 邉ｻ繝輔ぅ繝ｼ繝ｫ繝・
  - `character-reference`: `reference-diagnostics` 逕ｱ譚･縺ｮ縺・■ `CHARACTER_*` / `PORTRAIT_*` 繧ｳ繝ｼ繝峨∪縺溘・ character 邉ｻ繝輔ぅ繝ｼ繝ｫ繝・
- 繝倥ャ繝繝ｼ驛ｨ縺ｫ驥榊､ｧ蠎ｦ莉ｶ謨ｰ・医お繝ｩ繝ｼ/隴ｦ蜻・諠・ｱ・峨ｒ陦ｨ遉ｺ
- 螻暮幕驛ｨ縺ｫ驥榊､ｧ蠎ｦ繝輔ぅ繝ｫ繧ｿ縺ｨ繧ｫ繝・ざ繝ｪ繝輔ぅ繝ｫ繧ｿ繧定｡ｨ遉ｺ
  - 繧ｫ繝・ざ繝ｪ繝輔ぅ繝ｫ繧ｿ繝懊ち繝ｳ縺後き繝・ざ繝ｪ莉ｶ謨ｰ陦ｨ遉ｺ繧ょ・縺ｭ繧具ｼ井ｾ・ `蜈ｨ繧ｫ繝・ざ繝ｪ 4莉ｶ` / `讒区・ 3莉ｶ` / `邏譚仙盾辣ｧ 1莉ｶ` / `繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ蜿ら・ 0莉ｶ`・・
  - 驥榊､ｧ蠎ｦ繝輔ぅ繝ｫ繧ｿ縺ｨAND譚｡莉ｶ縺ｧ邨槭ｊ霎ｼ繧
- 髱槭け繝ｪ繝・け縺ｮ繧ｫ繝・ざ繝ｪ莉ｶ謨ｰ繝舌ャ繧ｸ陦後・蜑企勁貂医∩・・026-05-05 UI polish・・
- 蜷・ssue繧ｫ繝ｼ繝峨↓縲碁㍾螟ｧ蠎ｦ ﾂｷ 繧ｫ繝・ざ繝ｪ縲阪ｒ陦ｨ遉ｺ
- node-level縺ｮissue縺ｮ縺ｿ縲悟ｯｾ雎｡縺ｸ遘ｻ蜍輔阪・繧ｿ繝ｳ繧定｡ｨ遉ｺ・・sceneId && nodeId` 縺御ｸ｡譁ｹ縺ゅｋ蝣ｴ蜷茨ｼ・
- 蜈ｬ髢句・譖ｿ譎ゑｼ・index.vue`・峨↓ `getReferenceDiagnostics` 繧ょ他縺ｳ縲√き繝・ざ繝ｪ蛻･莉ｶ謨ｰ繧・warning遒ｺ隱阪ム繧､繧｢繝ｭ繧ｰ縺ｫ陦ｨ遉ｺ
  - 蜿ら・險ｺ譁ｭ蜿門ｾ怜､ｱ謨玲凾縺ｯ縲√Ο繝ｼ繧ｫ繝ｫ繝√ぉ繝・け縺ｮ縺ｿ縺ｧ騾ｲ繧√∝､ｱ謨玲葎繧偵ム繧､繧｢繝ｭ繧ｰ縺ｫ陦ｨ遉ｺ
  - error 繝悶Ο繝・け譚｡莉ｶ縺ｯ螟画峩縺ｪ縺暦ｼ医Ο繝ｼ繧ｫ繝ｫ `runScenarioCheck` 縺ｮ error 縺ｮ縺ｿ・・


<!-- impl: apps/frontend/utils/scenarioCheck.ts, apps/frontend/tests/scenarioCheck.spec.ts -->
- 譌｢蟄倥・髢句ｧ句慍轤ｹ/蜿ら・蛻・ｌ/蛻ｰ驕比ｸ崎・繝√ぉ繝・け縺ｫ蜉縺医※縲∽ｻ･荳九・warning繝√ぉ繝・け繧定ｿｽ蜉

| 繝√ぉ繝・け | 蟇ｾ雎｡ | severity |
|---------|------|----------|
| 繝弱・繝画悽譁・′遨ｺ縺ｾ縺溘・遨ｺ逋ｽ縺ｮ縺ｿ | 蜈ｨ繝弱・繝・| warning |
| 驕ｸ謚櫁い繝ｩ繝吶Ν縺檎ｩｺ縺ｾ縺溘・遨ｺ逋ｽ縺ｮ縺ｿ | 蜈ｨ驕ｸ謚櫁い・・targetNodeId=null`蜷ｫ繧・・| warning |
| 驕ｸ謚櫁い繝・・繧ｿ縺ｯ縺ゅｋ縺瑚｡ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺・莉ｶ | 蜈ｨ繝弱・繝・| warning |
| 髢句ｧ九す繝ｼ繝ｳ莉･螟悶〒 `startNodeId` 縺瑚ｨｭ螳壽ｸ医∩縺縺悟ｭ伜惠縺励↑縺・ヮ繝ｼ繝迂D繧貞盾辣ｧ | 髢句ｧ九す繝ｼ繝ｳ莉･螟悶・繧ｷ繝ｼ繝ｳ | warning |

- 莉雁屓霑ｽ蜉縺励◆ warning 縺ｯ API 蛛ｴ蜈ｬ髢句燕繝√ぉ繝・け縺ｧ蜈ｬ髢九ヶ繝ｭ繝・け縺励↑縺・ｼ域里蟄倥・ error 繝√ぉ繝・け縺ｮ縺ｿ縺・API 蛛ｴ縺ｧ縺ｮ繝悶Ο繝・け蟇ｾ雎｡・・
- 邏譚舌・繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ蜿ら・縺ｮ warning 讀懷・縺ｨ蜈ｬ髢句燕繝√ぉ繝・けUI縺ｸ縺ｮ邨ｱ蜷医・螳溯｣・ｸ医∩・・GET /games/:id/reference-diagnostics`・・
  - bg/BGM/SE/cover/portraitAsset 縺ｮ蜿ら・險ｺ譁ｭ縲《peakerCharacterId / portraits 縺ｮ蜿ら・險ｺ譁ｭ繧貞性繧
  - 蜑企勁貂医∩/蟄伜惠縺励↑縺・讓ｩ髯舌↑縺・遞ｮ蛻･驕輔＞縺ｮ warning 繧呈､懷・
  - 縺溘□縺励√％繧後ｉ縺ｮ warning 縺ｯ蜈ｬ髢九ｒ繝悶Ο繝・け縺励↑縺・
  - API蛛ｴ蜈ｬ髢九ヶ繝ｭ繝・け縺ｸ縺ｮ蜿ら・險ｺ譁ｭ邨ｱ蜷医・譛ｪ螳溯｣・・蟆・擂隱ｲ鬘・

蟆・擂隱ｲ鬘・
- 蜿ら・險ｺ譁ｭwarning縺ｮ閾ｪ蜍穂ｿｮ蠕ｩ/荳諡ｬ蟾ｮ縺玲崛縺・
- 繧ｯ繝ｬ繧ｸ繝・ヨ譛ｪ險ｭ螳壹メ繧ｧ繝・け
- 蠢・ｦ√↓蠢懊§縺蘗PI蛛ｴ蜈ｬ髢句ｯｩ譟ｻ縺ｸ縺ｮ蜿ら・險ｺ譁ｭ邨ｱ蜷茨ｼ医ヶ繝ｭ繝・け譚｡莉ｶ蛹悶☆繧九°縺ｯ蛻･騾碑ｨｭ險茨ｼ・
- 譚｡莉ｶ蛻・ｲ舌・螳悟・隧穂ｾ｡
- 螟画焚繧ｭ繝ｼ蟄伜惠繝√ぉ繝・け
- 繝輔Ο繝ｼ繝√Ε繝ｼ繝亥庄隕門喧
- 繧ｷ繝翫Μ繧ｪ Import/Export
- 蜈ｬ髢句燕繝√ぉ繝・け蟆ら畑逕ｻ髱｢
- 蜈ｬ髢句燕繝√ぉ繝・けUI縺ｮ螳悟・繝溘ル繝槭Ν蛹厄ｼ亥ｰ・擂隱ｲ鬘後・莉雁屓縺ｮMVP縺ｧ縺ｯ譛ｪ螳溯｣・ｼ・
  - 迴ｾ迥ｶ: 繝倥ャ繝繝ｼ縺ｫ驥榊､ｧ蠎ｦ莉ｶ謨ｰ繝舌ャ繧ｸ・医お繝ｩ繝ｼ/隴ｦ蜻・諠・ｱ・峨∝ｱ暮幕驛ｨ縺ｫ驥榊､ｧ蠎ｦ繝輔ぅ繝ｫ繧ｿ陦鯉ｼ九き繝・ざ繝ｪ繝輔ぅ繝ｫ繧ｿ陦・
  - 蟆・擂譯・ 繝倥ャ繝繝ｼ縺ｮ驥榊､ｧ蠎ｦ莉ｶ謨ｰ繝舌ャ繧ｸ繧偵け繝ｪ繝・け蜿ｯ閭ｽ繝輔ぅ繝ｫ繧ｿ縺ｫ縺励∝ｱ暮幕驛ｨ縺ｮ驥榊､ｧ蠎ｦ繝輔ぅ繝ｫ繧ｿ陦後ｒ蜑企勁縺吶ｋ
    - 螻暮幕驛ｨ縺ｯ繧ｫ繝・ざ繝ｪ繝輔ぅ繝ｫ繧ｿ・喫ssue荳隕ｧ繧剃ｸｭ蠢・↓縺吶ｋ
    - 繧ｹ繝壹・繧ｹ繧堤ｯ邏・＠縺､縺､縲√お繝ｩ繝ｼ/隴ｦ蜻・諠・ｱ縺ｸ縺ｮ邨槭ｊ霎ｼ縺ｿ縺ｯ邯ｭ謖√☆繧・
  - 迴ｾ蝨ｨ縺ｮUI縺ｯ險ｱ螳ｹ縺ｨ縺励∝ｰ・擂縺ｮUI謨ｴ逅・ち繧､繝溘Φ繧ｰ縺ｧ讀懆ｨ弱☆繧・

#### 繧ｷ繝ｼ繝ｳ繝ｩ繝吶Ν繝ｻ繧ｷ繝ｼ繝ｳ邂｡逅・ｧ謾ｹ蝟・ｼ・026-05-02 螳溯｣・ｸ医∩・・
- `GameScene.name` 繧偵す繝ｼ繝ｳ繝ｩ繝吶Ν縺ｨ縺励※豢ｻ逕ｨ・・B螟画峩繝ｻ繝槭う繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ縺ｪ縺暦ｼ・
- edit逕ｻ髱｢蟾ｦ繝壹う繝ｳ縺ｮ繧ｷ繝ｼ繝ｳ荳隕ｧ縺ｫ Scene逡ｪ蜿ｷ繝ｻ繧ｷ繝ｼ繝ｳ蜷阪・繝弱・繝画焚繧定｡ｨ遉ｺ
- 驕ｸ謚樔ｸｭ繧ｷ繝ｼ繝ｳ縺ｮ蜷榊燕繧貞・蜉帶ｬ・〒邱ｨ髮・庄閭ｽ・・nter or blur 縺ｧ `PATCH /games/scenes/:sceneId { name }` 菫晏ｭ假ｼ・
- 蜈･蜉帶ｬ・Λ繝吶Ν繧偵碁∈謚樔ｸｭ繧ｷ繝ｼ繝ｳ蜷阪阪↓邁｡逡･蛹厄ｼ郁｣懆ｶｳ譁・・蜑企勁・・
- 繧ｷ繝ｼ繝ｳ蜷阪′遨ｺ縺ｮ蝣ｴ蜷医・ `Scene N` 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ陦ｨ遉ｺ・医す繝ｼ繝ｳ荳隕ｧ繝ｻNodePicker蜈ｱ騾夲ｼ・
- 繧ｷ繝ｼ繝ｳ蜷榊､画峩蠕・ `scene.value` / `scenes.value` / `game.value.scenes` 繧貞叉譎ょ酔譛溪・ NodePicker 繝ｻ `findNodeLabel`・磯・遘ｻ蜈医Λ繝吶Ν・峨↓閾ｪ蜍募渚譏
- NodePicker 縺ｮ繧ｷ繝ｼ繝ｳ貅悶・陦ｨ遉ｺ縺ｯ譌｢螳溯｣・ｸ医∩・・Scene N: name` 蠖｢蠑上√ヮ繝ｼ繝画焚縲∫樟蝨ｨ繧ｷ繝ｼ繝ｳ繝舌ャ繧ｸ縲∵､懃ｴ｢繝ｻ隧ｳ邏ｰ繝励Ξ繝薙Η繝ｼ・・
- 蟆・擂隱ｲ鬘鯉ｼ亥ｮ溯｣・､厄ｼ・ 繧ｷ繝ｼ繝ｳ荳ｦ縺ｳ譖ｿ縺・/ 繧ｷ繝ｼ繝ｳ隱ｬ譏取枚 / 繧ｷ繝ｼ繝ｳ繧ｵ繝繝阪う繝ｫ / 繝輔Ο繝ｼ繝√Ε繝ｼ繝郁｡ｨ遉ｺ

#### NodePicker 縺ｮ迴ｾ迥ｶ縺ｨ谿玖ｪｲ鬘・

NodePicker 縺ｮ縲後す繝ｼ繝ｳ 竊・繝弱・繝峨堺ｺ梧ｮｵ髫朱∈謚朸I縺ｯ**螳溯｣・ｸ医∩**縲・

- 蟾ｦ繝壹う繝ｳ縺ｧ繧ｷ繝ｼ繝ｳ驕ｸ謚槭∝承繝壹う繝ｳ縺ｧ驕ｸ謚樔ｸｭ繧ｷ繝ｼ繝ｳ縺ｮ繝弱・繝峨ｒ驕ｸ謚・
- 讀懃ｴ｢谺・↓蜈･蜉帙☆繧九→蜈ｨ繧ｷ繝ｼ繝ｳ讓ｪ譁ｭ讀懃ｴ｢繝｢繝ｼ繝峨↓蛻・ｊ譖ｿ繧上ｊ縲√け繝ｪ繧｢蠕後・驕ｸ謚樔ｸｭ繧ｷ繝ｼ繝ｳ縺ｮ繝弱・繝我ｸ隕ｧ縺ｫ謌ｻ繧・
- 迴ｾ蝨ｨ繧ｷ繝ｼ繝ｳ縺ｮ譛譁ｰ繝弱・繝牙渚譏縺ｨ莉悶す繝ｼ繝ｳ蛟呵｣懃ｶｭ謖√↓蟇ｾ蠢・
- 繧ｭ繝ｼ繝懊・繝画桃菴・ 讀懃ｴ｢谺・・譛溘ヵ繧ｩ繝ｼ繧ｫ繧ｹ繝ｻ蜿ｳ繝壹う繝ｳ `竊疏 / `竊伝 / `Enter` / `Esc` 縺ｧ謫堺ｽ懷庄閭ｽ
- 隧ｳ邏ｰ繝励Ξ繝薙Η繝ｼ・域園螻槭す繝ｼ繝ｳ繝ｻNode逡ｪ蜿ｷ/ID繝ｻ譛ｬ譁・・繝ｬ繝薙Η繝ｼ繝ｻ驕ｸ謚櫁い謨ｰ繝ｻnextNode險ｭ螳壽怏辟｡繝ｻ髢句ｧ九ヮ繝ｼ繝芽｡ｨ遉ｺ・峨ｒ螳溯｣・ｸ医∩

谿玖ｪｲ鬘・
- 繧ｷ繝ｼ繝ｳ荳隕ｧ・亥ｷｦ繝壹う繝ｳ・峨・繧ｭ繝ｼ繝懊・繝画桃菴・
- `竊秦 / `竊蛋 縺ｾ縺溘・ `Ctrl+竊疏 / `Ctrl+竊伝 縺ｫ繧医ｋ繧ｷ繝ｼ繝ｳ蛻・ｊ譖ｿ縺・
- Tab 遘ｻ蜍墓凾縺ｮ繝輔か繝ｼ繧ｫ繧ｹ險ｭ險・
- 繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ菴咲ｽｮ菫晄戟
- 繧ｭ繝ｼ繝懊・繝画桃菴懊→讀懃ｴ｢蜈･蜉帙・蟷ｲ貂蛾亟豁｢縺ｮ縺輔ｉ縺ｪ繧区隼蝟・

<!-- impl: apps/frontend/pages/my/games/[id]/edit.vue (saveAndCreateNext) -->
#### 縲御ｿ晏ｭ倥＠縺ｦ谺｡縺ｮ繝弱・繝峨∈縲阪・蜍穂ｽ懊ヵ繝ｭ繝ｼ
1. 迴ｾ蝨ｨ縺ｮ繝弱・繝峨ｒ菫晏ｭ假ｼ・nodeDraft` 縺九ｉ `portraits` 縺ｮ `thumb` 繧帝勁螟悶＠縺ｦ騾∽ｿ｡・・
2. 繧ｳ繝斐・蟇ｾ雎｡鬆・岼・郁レ譎ｯ/繧ｭ繝｣繝ｩ/BGM/繧ｫ繝｡繝ｩ・峨ｒ謚ｽ蜃ｺ・・
   - `copyOpts` 繧ｪ繝悶ず繧ｧ繧ｯ繝茨ｼ・{ bg, chars, bgm, camera }`・峨〒蛻ｶ蠕｡
   - LocalStorage・・talking_copy_opts_v1`・峨↓豌ｸ邯壼喧
3. 譁ｰ隕上ヮ繝ｼ繝峨ｒ菴懈・・医ユ繧ｭ繧ｹ繝・隧ｱ閠・驕ｸ謚櫁い縺ｯ遨ｺ縲√さ繝斐・鬆・岼縺ｮ縺ｿ邯呎価・・
4. 迴ｾ蝨ｨ繝弱・繝峨・ `nextNodeId` 繧呈眠隕上ヮ繝ｼ繝迂D縺ｫ譖ｴ譁ｰ
5. 繝弱・繝我ｸ隕ｧ繧貞・蜿門ｾ励＠縲∵眠隕上ヮ繝ｼ繝峨∈驕ｷ遘ｻ・・selectNode()`・・
6. 繝医・繧ｹ繝磯夂衍・域・蜉・螟ｱ謨暦ｼ・

**萓句､門・逅・*:
- 菫晏ｭ伜､ｱ謨玲凾・壹ヨ繝ｼ繧ｹ繝医〒繧ｨ繝ｩ繝ｼ陦ｨ遉ｺ縲√ヮ繝ｼ繝我ｸ隕ｧ縺ｯ譖ｴ譁ｰ縺励↑縺・
- `saving` ref 縺ｧ騾｣謇馴亟豁｢・亥ｮ溯｡御ｸｭ縺ｯ `Ctrl/竚・Enter` 繧堤┌隕厄ｼ・

- **髢句ｧ句慍轤ｹ縺ｮ險ｭ螳・*:
  - 繝弱・繝牙・: 蜷・ヮ繝ｼ繝牙・縺ｮ縲娯霧縺薙・繝弱・繝峨°繧蛾幕蟋九阪・繧ｿ繝ｳ縺ｧ `GameScene.startNodeId` 繧・PATCH 菫晏ｭ倥＠縲∝酔譎ゅ↓謇螻槭す繝ｼ繝ｳ繧・`GameProject.startSceneId` 縺ｫ蜷梧悄
  - 繧ｷ繝ｼ繝ｳ蛛ｴ: 繧ｷ繝ｼ繝ｳ荳隕ｧ縺ｮ縲後％縺ｮ繧ｷ繝ｼ繝ｳ縺九ｉ髢句ｧ九阪〒 `GameProject.startSceneId` 繧呈峩譁ｰ
    - 譌｢蟄倥・ `startNodeId` 縺後≠繧後・邯ｭ謖・
    - 譛ｪ險ｭ螳壹↑繧牙・鬆ｭ繝弱・繝峨ｒ `startNodeId` 縺ｫ閾ｪ蜍戊ｨｭ螳・
    - 繝弱・繝・莉ｶ繧ｷ繝ｼ繝ｳ縺ｯ險ｭ螳壹○縺夊ｭｦ蜻願｡ｨ遉ｺ

**遒ｺ隱阪Ο繧ｰ・・026-05-02・・*:
- `pnpm -w build`: 笶・`apps/api prisma:generate` 縺ｮ `query_engine-windows.dll.node` rename 縺ｧ `EPERM`・医ヵ繧｡繧､繝ｫ繝ｭ繝・け・・
- `pnpm -C apps/frontend test`: 笨・2 files / 7 tests passed
- 譛ｪ螳溯｡・ 繝悶Λ繧ｦ繧ｶ謇句虚遒ｺ隱搾ｼ医す繝ｼ繝ｳ蛛ｴ髢句ｧ玖ｨｭ螳啅I謫堺ｽ懊・蜈ｬ髢・繝・せ繝医・繝ｬ繧､髢句ｧ句慍轤ｹ縺ｮ螳溽判髱｢遒ｺ隱搾ｼ・
  - 逅・罰: 縺薙・螳溯｡檎腸蠅・〒縺ｯ繝悶Λ繧ｦ繧ｶ謇句虚E2E繧貞ｮ滓命縺励※縺・↑縺・◆繧・
- **繧ｫ繝｡繝ｩ** 窶ｦ 邱ｨ髮・I縺ｯ螳溯｣・ｸ医∩・亥咲紫 zoom 100窶・00%縲∽ｸｭ蠢・cx,cy 0窶・00%・峨４tageCanvas 縺ｸ縺ｮ蜿肴丐貂医∩・・iniStage 縺ｫ繧る←逕ｨ貂医∩・・
- **繧ｫ繝｡繝ｩ貍泌・・・ameraFx・・* 窶ｦ 繧ｨ繝・ぅ繧ｿ縺ｧ縲後き繝｡繝ｩ貍泌・縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺九ｉ險ｭ螳壼庄閭ｽ縲ゅユ繧ｹ繝医・繝ｬ繧､縺ｧ縺ｯ `requestAnimationFrame` 縺ｧ貊代ｉ縺九↑繧ｫ繝｡繝ｩ繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ繧貞ｮ溽樟
- **繝薙ず繝･繧｢繝ｫ繧ｨ繝輔ぉ繧ｯ繝茨ｼ・isualFx・・* 窶ｦ 縲後ン繧ｸ繝･繧｢繝ｫ繧ｨ繝輔ぉ繧ｯ繝医阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｧ險ｭ螳壹ら判髱｢謠ｺ繧鯉ｼ・hake・峨→繝輔Λ繝・す繝･・・lash・峨・2遞ｮ鬘槭√◎繧後◇繧悟ｰ上・荳ｭ繝ｻ螟ｧ縺ｮ3谿ｵ髫主ｼｷ蠎ｦ繧帝∈謚槫庄閭ｽ縲ゅお繝・ぅ繧ｿ縺ｧ縺ｯ繝励Ξ繝薙Η繝ｼ繝懊ち繝ｳ縺ｧ蜊ｳ蠎ｧ縺ｫ遒ｺ隱阪〒縺阪√ユ繧ｹ繝医・繝ｬ繧､縺ｧ縺ｯ繝弱・繝芽｡ｨ遉ｺ譎ゅ↓閾ｪ蜍募・逕溘ら判髱｢蜈ｨ菴難ｼ郁レ譎ｯ繝ｻ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ繝ｻ繝｡繝・そ繝ｼ繧ｸ繧ｦ繧｣繝ｳ繝峨え蜷ｫ繧・峨↓驕ｩ逕ｨ縺輔ｌ縲～requestAnimationFrame` 繝吶・繧ｹ縺ｮ貊代ｉ縺九↑繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ
- **繧ｻ繝ｪ繝慕ｶ咏ｶ夊｡ｨ遉ｺ・・ontinuesPreviousText・・* 窶ｦ 縲悟燕繝弱・繝峨・繧ｻ繝ｪ繝輔ｒ豸医＆縺壹↓邯壹￠繧九阪メ繧ｧ繝・け繝懊ャ繧ｯ繧ｹ縺ｧ險ｭ螳壹ゆｼ夊ｩｱ縺ｮ豬√ｌ繧堤ｶｭ謖√＠縺滓ｼ泌・縺悟庄閭ｽ

**繝励Ξ繝薙Η繝ｼ**:
- 騾壼ｸｸ陦ｨ遉ｺ・壼承繝壹う繝ｳ縺ｫ16:9縺ｮ繧ｹ繝・・繧ｸ繧定｡ｨ遉ｺ縲∝ｹ・・繝ｪ繧ｻ繝・ヨ・・/M/L・峨〒隱ｿ謨ｴ蜿ｯ閭ｽ
- 蜈ｨ逕ｻ髱｢陦ｨ遉ｺ・壼ｷｦ縺ｫ繧ｹ繝・・繧ｸ縲∝承縺ｫ繝輔か繝ｼ繝繧・繧ｫ繝ｩ繝驟咲ｽｮ縲ゅせ繝・・繧ｸ縺ｯ譛螟ｧ72vh縲√い繧ｹ繝壹け繝域ｯ・6:9繧堤ｶｭ謖・
- 縺ｩ縺｡繧峨ｂ `StageCanvas` + `MessageWindow` 縺ｧ謠冗判縺励・*蜷御ｸ縺ｮ逶ｸ蟇ｾ繝舌Λ繝ｳ繧ｹ**縺ｧ隕九∴繧・

### API 讎りｦ・ｼ郁ｪ榊庄: 謇譛芽・ｼ・
- `GET /games/:id/scenes` / `POST /games/:id/scenes`・・psert・・
- `GET /games/scenes/:sceneId/nodes` / `POST /games/scenes/:sceneId/nodes`・・hoices 蜷梧｢ｱ縺ｧ Upsert・・
- `DELETE /games/nodes/:nodeId`
  - 譁ｰ隕・Node 霑ｽ蜉譎ゅ・ `order = (scene蜀・max + 1)` ・・GamesService.upsertNode` 蜿ら・・・
  - 譌｢蟄俶峩譁ｰ縺ｯ `id` 譛臥┌縺ｧ蛻・ｲ・

**GameNode 繝・・繧ｿ讒矩**:
<!-- impl: apps/api/prisma/schema.prisma, packages/types/src/index.ts -->
```ts
interface GameNode {
  id: string;
  sceneId: string;
  type: 'DIALOG';
  order: number;
  speakerCharacterId?: string;
  speakerDisplayName?: string;
  text?: string;
  bgAssetId?: string;
  musicAssetId?: string;
  sfxAssetId?: string;
  nextNodeId?: string;
  continuesPreviousText?: boolean;
  portraits?: Array<{
    characterId: string;
    imageId: string;
    key?: string;
    x: number;  // 0-100%
    y: number;  // 0-100%
    scale: number;  // %
    z?: number;
  }>;
  camera?: {
    zoom: number;  // 100-300%
    cx: number;    // 0-100% (center x)
    cy: number;    // 0-100% (center y)
  };
  cameraFx?: {
    from?: { zoom?: number; cx?: number; cy?: number };
    to?: { zoom?: number; cx?: number; cy?: number };
    durationMs?: number;
    mode?: 'cut' | 'together' | 'pan-then-zoom' | 'zoom-then-pan';
  };
  visualFx?: {
    type: 'shake' | 'flash';
    intensity: 'small' | 'medium' | 'large';
  };
  choices?: Array<{
    id: string;
    label: string;
    targetNodeId: string;
  }>;
}
```

**繝薙ず繝･繧｢繝ｫ繧ｨ繝輔ぉ繧ｯ繝郁ｩｳ邏ｰ**:
<!-- impl: apps/frontend/composables/useVisualEffects.ts -->
- **逕ｻ髱｢謠ｺ繧・(shake)**:
  - small: 蠑ｷ蠎ｦ5px, 300ms, 30Hz
  - medium: 蠑ｷ蠎ｦ12px, 500ms, 30Hz
  - large: 蠑ｷ蠎ｦ25px, 700ms, 30Hz
  - 貂幄｡ｰ縺吶ｋ謖ｯ蜍包ｼ・decay = 1 - progress`・峨々霆ｸ縺ｨY霆ｸ縺ｧ逡ｰ縺ｪ繧区険蟷・
- **繝輔Λ繝・す繝･ (flash)**:
  - small: 荳埼乗・蠎ｦ0.4, 200ms, 逋ｽ濶ｲ
  - medium: 荳埼乗・蠎ｦ0.7, 300ms, 逋ｽ濶ｲ
  - large: 荳埼乗・蠎ｦ1.0, 400ms, 逋ｽ濶ｲ
  - 繝輔ぉ繝ｼ繝峨い繧ｦ繝医い繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ

**繧ｨ繝輔ぉ繧ｯ繝亥ｮ溯｣・*:
<!-- impl: apps/frontend/components/game/StageCanvas.vue -->
- `.stage` 蜈ｨ菴薙↓ `transform` 縺ｧshake驕ｩ逕ｨ・郁レ譎ｯ繝ｻ繧ｭ繝｣繝ｩ繝ｻ繝｡繝・そ繝ｼ繧ｸ蜷ｫ繧・・
- 繧ｨ繝輔ぉ繧ｯ繝医Ξ繧､繝､繝ｼ・・.effect-layer`・峨〒flash繧定｡ｨ遉ｺ・・-index: 50・・
- `requestAnimationFrame` 繝吶・繧ｹ縺ｮ貊代ｉ縺九↑繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ
- 繧ｯ繝ｪ繝ｼ繝ｳ繧｢繝・・蜃ｦ逅・ｼ・cancelAnimationFrame`・峨〒驕ｩ蛻・↓蛛懈ｭ｢

### 譌｢遏･縺ｮ蛻ｶ髯・/ TODO
- 髻ｳ螢ｰ蜷梧э縺ｯ `localStorage('talking_audio_consent_v1')` 縺ｧ菫晄戟
- 驕ｸ謚櫁い・・hoices・峨・ UI 縺ｯ譛蟆・
- `GameChoice.targetNodeId` 縺ｮ `''` 驕狗畑縺ｯ證ｫ螳壹〒縺ゅｊ縲］ullable 蛹悶∪縺溘・譛ｪ險ｭ螳夊｡ｨ迴ｾ縺ｮ謨ｴ逅・′蠢・ｦ・
- target譛ｪ險ｭ螳壹・驕ｸ謚櫁い繧偵・繝ｬ繧､譎ゅ↓縺ｩ縺・桶縺・°縺ｯ蟆・擂隱ｲ鬘・
- NodePicker 繧ｷ繝ｼ繝ｳ荳隕ｧ・亥ｷｦ繝壹う繝ｳ・峨・繧ｭ繝ｼ繝懊・繝画桃菴懊・繝輔か繝ｼ繧ｫ繧ｹ險ｭ險医・繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ菴咲ｽｮ菫晄戟縺ｯ谿玖ｪｲ鬘・
- 繝弱・繝牙盾辣ｧ蛻・ｌ隴ｦ蜻翫∝芦驕比ｸ崎・繝弱・繝画､懷・縲√ヵ繝ｭ繝ｼ繝√Ε繝ｼ繝亥庄隕門喧縺ｯ蟆・擂隱ｲ鬘・
- 繧ｷ繝ｼ繝ｳ/繝弱・繝峨さ繝斐・繝ｻ遘ｻ蜍輔・蟆・擂隱ｲ鬘・
  - 繧ｷ繝ｼ繝ｳ隍・｣ｽ・医す繝ｼ繝ｳ蜀・ヮ繝ｼ繝・驕ｸ謚櫁い縺ｮ荳諡ｬ隍・｣ｽ縲√す繝ｼ繝ｳ蜀・盾辣ｧ蜀阪・繝・・縲√す繝ｼ繝ｳ螟門盾辣ｧ繝昴Μ繧ｷ繝ｼ驕ｸ謚橸ｼ・
  - 繝弱・繝芽､・｣ｽ・亥酔荳繧ｷ繝ｼ繝ｳ蜀・､・｣ｽ譎ゅ・ `nextNodeId` / `choice.targetNodeId` 縺ｮ謇ｱ縺・婿驥晢ｼ・
  - 繝弱・繝臥ｧｻ蜍包ｼ亥挨繧ｷ繝ｼ繝ｳ遘ｻ蜍墓凾縺ｮID邯ｭ謖∵婿驥昴∝盾辣ｧ邯ｭ謖・隴ｦ蜻翫～startNodeId` 蠖ｱ髻ｿ謨ｴ逅・ｼ・
  - 繧ｷ繝ｼ繝ｳ髢薙ヮ繝ｼ繝峨さ繝斐・・医さ繝斐・蜈医〒譁ｰnodeId逋ｺ陦後∝盾辣ｧ髢｢菫ゅ・謇ｱ縺・ｼ・
  - 莉倬囂隱ｲ鬘・ undo/redo縲∵桃菴懷燕遒ｺ隱阪ム繧､繧｢繝ｭ繧ｰ縲√さ繝斐・蜈磯∈謚朸I縲∝､ｧ驥上ヮ繝ｼ繝画桃菴懊√す繝ｼ繝ｳ/繝弱・繝峨ユ繝ｳ繝励Ξ繝ｼ繝亥喧縲√す繝翫Μ繧ｪImport/Export騾｣謳ｺ
- 繧ｷ繝翫Μ繧ｪ縺ｮ繧ｨ繧ｯ繧ｹ繝昴・繝・繧､繝ｳ繝昴・繝茨ｼ・SON 竊・蟆・擂逧・↓AI蜷代￠Markdown/DSL・峨・蟆・擂隱ｲ鬘・
- 繧ｭ繝ｼ繧ｳ繝ｳ繝輔ぅ繧ｰ繝ｻAUTO蜀咲函繝ｻSkip讖溯・繝ｻ繝励Ξ繧､繝､繝ｼ縺斐→縺ｮ繧ｻ繝ｼ繝悶ョ繝ｼ繧ｿ險ｭ險医・蟆・擂隱ｲ鬘・
- 繧ｹ繝槭・/繧ｿ繝悶Ξ繝・ヨ蜷代￠繝励Ξ繧､謫堺ｽ懈怙驕ｩ蛹悶・蟆・擂隱ｲ鬘・
- 逕ｻ蜒上・驕・ｻｶ隱ｭ霎ｼ繝ｻAVIF/WebP 譛驕ｩ蛹悶・蛻･繧ｿ繧ｹ繧ｯ
- BGM繧ｯ繝ｭ繧ｹ繝輔ぉ繝ｼ繝峨・譛ｪ螳溯｣・ｼ育樟蝨ｨ縺ｯ逶ｴ蛻励ヵ繧ｧ繝ｼ繝会ｼ・
- 繝弱・繝峨＃縺ｨ縺ｮ fadeMs 謖・ｮ壹・譛ｪ螳溯｣・ｼ亥崋螳壹ヵ繧ｧ繝ｼ繝画凾髢難ｼ・
- BGM/SE 髻ｳ驥剰ｨｭ螳啅I縺ｯ譛ｪ螳溯｣・
- SE蛟句挨繝輔ぉ繝ｼ繝会ｼ医ヮ繝ｼ繝牙挨蛻ｶ蠕｡蜷ｫ繧・峨・譛ｪ螳溯｣・
- 髻ｳ螢ｰ繝溘く繧ｵ繝ｼ縲∬､・焚BGM繝ｬ繧､繝､繝ｼ縲√Θ繝ｼ繧ｶ繝ｼ險ｭ螳壻ｿ晏ｭ倥・譛ｪ螳溯｣・
- 蜈ｬ髢九ご繝ｼ繝荳隕ｧ `/games` 縺ｮ蟆・擂隱ｲ鬘鯉ｼ井ｻ雁屓譛ｪ螳溯｣・ｼ・
  - 繝壹・繧ｸ繝阪・繧ｷ繝ｧ繝ｳ / 辟｡髯舌せ繧ｯ繝ｭ繝ｼ繝ｫ譛驕ｩ蛹・
  - 莠ｺ豌鈴・/ 繝励Ξ繧､謨ｰ鬆・/ 縺頑ｰ励↓蜈･繧頑焚鬆・ｼ磯寔險亥渕逶､謨ｴ蛯吝ｾ鯉ｼ・
  - 繧ｿ繧ｰ讀懃ｴ｢ / 菴懆・､懃ｴ｢
  - 鬮伜ｺｦ縺ｪ蜈ｨ譁・､懃ｴ｢・・eilisearch豢ｻ逕ｨ・・
  - `/my/games` 縺ｸ縺ｮ讀懃ｴ｢繝ｻ荳ｦ縺ｳ譖ｿ縺・I譁ｹ驥晉ｵｱ荳
  - 繝ｬ繧ｳ繝｡繝ｳ繝・
- 蜈ｬ髢九ご繝ｼ繝縺ｮ繧ｿ繧ｰ/繧ｸ繝｣繝ｳ繝ｫ讖溯・・亥ｰ・擂隱ｲ鬘鯉ｼ・
  - 繧ｲ繝ｼ繝邱ｨ髮・凾縺ｮ繧ｿ繧ｰ險ｭ螳夲ｼ・/my/games`・・
  - 蝗ｺ螳壹ず繝｣繝ｳ繝ｫ繧ｿ繧ｰ・井ｾ・ 諱区・ / 繝帙Λ繝ｼ / 繝輔ぃ繝ｳ繧ｿ繧ｸ繝ｼ / SF / 繝溘せ繝・Μ繝ｼ / 繧ｳ繝｡繝・ぅ / 譌･蟶ｸ / 繧ｷ繝ｪ繧｢繧ｹ・・
  - 蠖｢蠑上ち繧ｰ・井ｾ・ 遏ｭ邱ｨ / 髟ｷ邱ｨ / 菴馴ｨ鍋沿 / 螳檎ｵ先ｸ医∩ / 騾｣霈我ｸｭ・・
  - 繧ｷ繧ｹ繝・Β繧ｿ繧ｰ・井ｾ・ 驕ｸ謚櫁い縺ゅｊ / 繝槭Ν繝√お繝ｳ繝・/ 繝懊う繧ｹ縺ゅｊ / BGM縺ゅｊ・・
  - 蝗ｺ螳壹ち繧ｰ縺ｨ繝輔Μ繝ｼ繝ｯ繝ｼ繝峨ち繧ｰ縺ｮ蛻・屬險ｭ險・
  - 繧ｿ繧ｰ譛ｪ險ｭ螳壽凾縺ｮ蜈ｬ髢句燕 warning
  - 繧ｿ繧ｰ邨槭ｊ霎ｼ縺ｿ/繧ｿ繧ｰ蛻･荳隕ｧ縲｀eilisearch繝ｻ鬮伜ｺｦ讀懃ｴ｢縺ｨ縺ｮ騾｣謳ｺ
- 蜈ｬ髢九ご繝ｼ繝蛻・梵縺ｮ蟆・擂隱ｲ鬘・
  - 繝ｦ繝九・繧ｯ髢ｲ隕ｧ謨ｰ / 繝ｦ繝九・繧ｯ繝励Ξ繧､謨ｰ
  - IP / 繝ｦ繝ｼ繧ｶ繝ｼ蜊倅ｽ阪・驥崎､・勁螟・
  - 譌･蛻･髮・ｨ・
  - 菴懆・ム繝・す繝･繝懊・繝・
  - 繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ
  - 繧､繝吶Φ繝医Ο繧ｰ繝・・繝悶Ν
  - 繧｢繝翫Μ繝・ぅ繧ｯ繧ｹ蝓ｺ逶､

---

### ChangeLog (chat handover)

- 2026-05-04: `/my/games/:id/edit` 縺ｮ荳企Κ縺ｫ蟶ｸ譎り｡ｨ遉ｺ縺励※縺・◆繧ｲ繝ｼ繝蝓ｺ譛ｬ諠・ｱ繝輔か繝ｼ繝繧呈彫蜴ｻ縺励～MessageThemeModal.vue` 繧偵後ご繝ｼ繝蜈ｨ菴楢ｨｭ螳壹阪∈諡｡蠑ｵ縲ょ・鬆ｭ縺ｫ `蝓ｺ譛ｬ諠・ｱ` 繧ｿ繝悶ｒ霑ｽ蜉縺励～title` / `summary` 縺ｮ蜈･蜉帶､懆ｨｼ・・itle蠢・医・遨ｺ逋ｽ荳榊庄繝ｻ120譁・ｭ嶺ｻ･蜀・《ummary莉ｻ諢上・500譁・ｭ嶺ｻ･蜀・ｼ峨∵枚蟄玲焚陦ｨ遉ｺ縲～PATCH /games/:id` 縺ｸ縺ｮ蜷梧凾菫晏ｭ假ｼ・itle/summary/messageTheme/gameUiTheme/backlogTheme・峨ｒ螳溯｣・ゆｿ晏ｭ伜ｾ後・隕ｪ逕ｻ髱｢縺ｮ繧ｿ繧､繝医Ν/讎りｦ∬｡ｨ遉ｺ縺ｸ蜊ｳ譎ょ渚譏縲・
- 2026-05-04: 繧ｲ繝ｼ繝蝓ｺ譛ｬ諠・ｱ邱ｨ髮・VP繧貞ｮ溯｣・Ａ/my/games/:id/edit` 縺ｫ `title` / `summary` 邱ｨ髮・I繧定ｿｽ蜉縺励∽ｿ晏ｭ倅ｸｭ迥ｶ諷九・譛ｪ螟画峩譎ら┌蜉ｹ蛹悶・謌仙粥/螟ｱ謨鈴夂衍繧貞ｮ溯｣・り､・｣ｽ逶ｴ蠕後・ `蜈・ち繧､繝医Ν 縺ｮ繧ｳ繝斐・` 繧貞酔逕ｻ髱｢縺ｧ閾ｪ辟ｶ縺ｫ螟画峩蜿ｯ閭ｽ縲・PI蛛ｴ縺ｯ `PATCH /games/:id` 縺ｮ owner蛻ｶ蠕｡/蜑企勁貂医∩蛻ｶ蠕｡繧堤ｶｭ謖√＠縺､縺､縲～title` 蠢・茨ｼ育ｩｺ逋ｽ縺ｮ縺ｿ荳榊庄・峨・`summary` 莉ｻ諢上・蜈･蜉帶､懆ｨｼ・・title<=120`, `summary<=500`・峨ｒ霑ｽ蜉縲ＡisPublic: true` 縺ｮ縺ｨ縺阪□縺大・髢句燕繝√ぉ繝・け繧貞ｮ溯｡後☆繧区里蟄俶嫌蜍輔ｒ邯ｭ謖√ら｢ｺ隱咲ｵ先棡: `pnpm -w build` 笶鯉ｼ・apps/api prisma:generate` 縺ｮ `query_engine-windows.dll.node` rename 縺ｧ EPERM・・ `pnpm -C apps/frontend test` 笨・ｼ・ files / 31 tests passed・・ `pnpm -C apps/api run test` 笶鯉ｼ・ERR_PNPM_NO_SCRIPT`・峨・
- 2026-05-04: 繧ｲ繝ｼ繝隍・｣ｽMVP繧貞ｮ溯｣・ＡPOST /games/:id/duplicate` 繧定ｿｽ蜉縺励｛wner髯仙ｮ壹・蜑企勁貂医∩髯､螟悶・繝医Λ繝ｳ繧ｶ繧ｯ繧ｷ繝ｧ繝ｳ螳溯｡後〒 `GameProject`/`GameScene`/`GameNode`/`GameChoice` 繧定､・｣ｽ縲ＡstartSceneId`/`startNodeId`/`nextNodeId`/`targetNodeId`/`alternateTargetNodeId` 縺ｯ譁ｰID縺ｸ蜀阪・繝・・縺励∝｣翫ｌ縺溷盾辣ｧ縺ｯ `null` 縺ｫ螳牙・蛹悶り､・｣ｽ蜈医・蟶ｸ縺ｫ髱槫・髢九～viewCount`/`playCount` 縺ｯ0縲√そ繝ｼ繝悶ョ繝ｼ繧ｿ遲峨・髱櫁､・｣ｽ縲√い繧ｻ繝・ヨ縺ｯID蜿ら・繧堤ｶｭ謖√Ａ/my/games` 縺ｫ遒ｺ隱堺ｻ倥″縲後ご繝ｼ繝繧定､・｣ｽ縲阪・繧ｿ繝ｳ繧定ｿｽ蜉縺励∵・蜉滓凾縺ｫ荳隕ｧ蜀榊叙蠕暦ｼ玖､・｣ｽ蜈育ｷｨ髮・判髱｢縺ｸ驕ｷ遘ｻ縲ら｢ｺ隱咲ｵ先棡: `pnpm -w build` 笶鯉ｼ・apps/api prisma:generate` 縺ｮ `query_engine-windows.dll.node` rename 縺ｧ EPERM・・ `pnpm -C apps/api build` 笶鯉ｼ亥酔逅・罰・・ `pnpm -C apps/frontend test` 笨・ｼ・ files / 31 tests passed・・ API test script 縺ｯ譛ｪ螳夂ｾｩ縺ｮ縺溘ａ譛ｪ螳溯｡後・
- 2025-11-02: 螳溯｣・ｒ譬ｹ諡縺ｫ繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ讖溯・縺ｮ繝｢繝・Ν/逕ｻ髱｢/API繧呈ｭ｣隕丞喧縲・avorites 繧偵い繧ｻ繝・ヨ/繧ｭ繝｣繝ｩ讓ｪ譁ｭ縺ｧ邨ｱ荳・域･ｽ隕ｳ譖ｴ譁ｰ繝ｻ荳隕ｧ蜷梧悄繝ｻ豁｣隕丞喧髢｢謨ｰ・峨よ､懃ｴ｢/URL 蜷梧悄縺ｮ繧ｯ繧ｨ繝ｪ鬆・岼繧呈・險倥らｽｲ蜷攻RL縺ｮ蜿門ｾ・蜀榊叙蠕玲婿驥昴→ `$api` 邨檎罰縺ｮ譬ｹ諡繧貞・蜈ｸ莉倥″縺ｧ霑ｽ險倥よ里遏･縺ｮ關ｽ縺ｨ縺礼ｩｴ縺ｨ繝・せ繝・ODO繧呈紛逅・・
- 2025-11-04: 繧ｲ繝ｼ繝蛻ｶ菴懶ｼ夷ｲ・我ｻ墓ｧ倥ｒ霑ｽ蜉縲ゅす繝ｼ繝ｳ/繝弱・繝画ｧ矩縲｝ortraits 驟咲ｽｮ縲√き繝｡繝ｩ謫堺ｽ懊∫ｽｲ蜷・URL 邨檎罰縺ｮ逕ｻ蜒・髻ｳ螢ｰ蜿門ｾ励ｒ譏手ｨ倥・
- 2025-12-07: 繧ｲ繝ｼ繝蛻ｶ菴懈ｩ溯・繧呈僑蠑ｵ縲ＡcontinuesPreviousText`・医そ繝ｪ繝慕ｶ咏ｶ夊｡ｨ遉ｺ・峨→ `cameraFx`・医き繝｡繝ｩ貍泌・・峨ヵ繧｣繝ｼ繝ｫ繝峨ｒ霑ｽ蜉縲・essageThemeV2 縺ｫ繧ｰ繝ｩ繝・・繧ｷ繝ｧ繝ｳ・・gradientDirection`, `gradientColor`・峨→繝輔か繝ｳ繝医せ繧ｿ繧､繝ｫ・・fontWeight`, `fontStyle`・峨・繝ｭ繝代ユ繧｣繧定ｿｽ蜉縲ゅき繝｡繝ｩ貍泌・縺ｧ縺ｯ4縺､縺ｮ繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ繝｢繝ｼ繝会ｼ・ogether/pan-then-zoom/zoom-then-pan/cut・峨ｒ螳溯｣・＠縲～requestAnimationFrame` 縺ｧ貊代ｉ縺九↑蜍輔″繧貞ｮ溽樟縲ゅお繝・ぅ繧ｿ縺ｧ縺ｯ繧ｭ繝ｼ繝懊・繝峨す繝ｧ繝ｼ繝医き繝・ヨ・・trl/竚・Enter, Ctrl/竚・K, F, Esc・峨ｒ諡｡蜈・＠縲¨odePicker 縺ｫ繧医ｋ谺｡繝弱・繝蛾∈謚槭→縲御ｿ晏ｭ倥＠縺ｦ谺｡縺ｮ繝弱・繝峨∈縲肴ｩ溯・繧貞ｼｷ蛹悶ＡvisualFx`・医ン繧ｸ繝･繧｢繝ｫ繧ｨ繝輔ぉ繧ｯ繝茨ｼ峨ｒ霑ｽ蜉縺励∫判髱｢謠ｺ繧鯉ｼ・hake・峨→繝輔Λ繝・す繝･・・lash・峨・2遞ｮ鬘榲・谿ｵ髫主ｼｷ蠎ｦ縺ｮ繝励Μ繧ｻ繝・ヨ繧ｨ繝輔ぉ繧ｯ繝医ｒ螳溯｣・ゅお繝・ぅ繧ｿ縺ｧ縺ｮ繝励Ξ繝薙Η繝ｼ讖溯・縺ｨ繝・せ繝医・繝ｬ繧､縺ｧ縺ｮ閾ｪ蜍募・逕溘↓蟇ｾ蠢懊・
- 2026-05-01: 繝弱・繝牙炎髯､MVP繝ｻ繧ｷ繝ｼ繝ｳ蜑企勁MVP繧貞ｮ溯｣・ょ炎髯､蜑咲｢ｺ隱阪→蜿ら・莉ｶ謨ｰ陦ｨ遉ｺ縲∝炎髯､譎ゅ・蜿ら・隗｣髯､繧貞渚譏縲ゅご繝ｼ繝蜑企勁蟆守ｷ壹→ `GameChoice.targetNodeId` 縺ｮ譛ｪ險ｭ螳夊｡ｨ迴ｾ縺ｯ蟆・擂隱ｲ鬘後→縺励※謨ｴ逅・・
- 2026-05-01: 繧ｲ繝ｼ繝蜑企勁蟆守ｷ壹ｒ螳溯｣・ｸ医∩縺ｫ譖ｴ譁ｰ・・/my/games` 縺九ｉ遒ｺ隱堺ｻ倥″ soft delete縲∝炎髯､貂医∩繧ｲ繝ｼ繝縺ｮ蜷・判髱｢驕ｮ譁ｭ・峨・odePicker縲後す繝ｼ繝ｳ 竊・繝弱・繝峨堺ｺ梧ｮｵ髫朱∈謚朸I繝ｻ繧ｭ繝ｼ繝懊・繝画桃菴廴VP繝ｻ隧ｳ邏ｰ繝励Ξ繝薙Η繝ｼ繧貞ｮ溯｣・ｸ医∩縺ｨ縺励※蜿肴丐縺励∵ｮ玖ｪｲ鬘鯉ｼ亥ｷｦ繝壹う繝ｳ繧ｭ繝ｼ繝懊・繝画桃菴懊・繝輔か繝ｼ繧ｫ繧ｹ險ｭ險医・繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ菫晄戟・峨ｒ謨ｴ逅・ゅご繝ｼ繝繝励Ξ繧､逕ｻ髱｢繧ｭ繝ｼ繝懊・繝画桃菴廴VP縺ｮ莉墓ｧ假ｼ・nter/Space繝ｻ竊・竊薙・謨ｰ蟄励く繝ｼ繝ｻEsc・峨ｒ霑ｽ蜉縲１ROJECT_SPEC.md 縺ｨ ROADMAP.md 繧呈怙譁ｰ繧ｳ繝ｼ繝牙渕貅悶〒謨ｴ蜷医ゆｻ雁屓縺ｯ繝峨く繝･繝｡繝ｳ繝域峩譁ｰ縺ｮ縺ｿ縺ｧ build/test 縺ｯ荳崎ｦ√・
- 2026-05-02: 繧ｷ繝ｼ繝ｳ繝ｩ繝吶Ν繝ｻ繧ｷ繝ｼ繝ｳ邂｡逅・ｧ謾ｹ蝟МVP繧貞ｮ溯｣・ＡGameScene.name` 繧偵す繝ｼ繝ｳ繝ｩ繝吶Ν縺ｨ縺励※豢ｻ逕ｨ・・B螟画峩繝ｻ繝槭う繧ｰ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ縺ｪ縺暦ｼ峨Ｆdit逕ｻ髱｢蟾ｦ繝壹う繝ｳ縺ｮ繧ｷ繝ｼ繝ｳ荳隕ｧ縺ｫ Scene逡ｪ蜿ｷ繝ｻ繧ｷ繝ｼ繝ｳ蜷阪・繝弱・繝画焚繧定｡ｨ遉ｺ縲る∈謚樔ｸｭ繧ｷ繝ｼ繝ｳ縺ｮ蜷榊燕繧貞・蜉帶ｬ・〒邱ｨ髮・庄閭ｽ縺ｫ・・nter/blur縺ｧ菫晏ｭ假ｼ峨ゅす繝ｼ繝ｳ蜷榊､画峩蠕後・繧ｷ繝ｼ繝ｳ荳隕ｧ繝ｻNodePicker繝ｻ驕ｷ遘ｻ蜈医Λ繝吶Ν縺ｸ縺ｮ蜊ｳ譎ょ渚譏繧貞ｮ溯｣・よ悴蟇ｾ蠢懷ｰ・擂隱ｲ鬘鯉ｼ井ｸｦ縺ｳ譖ｿ縺医・隱ｬ譏取枚繝ｻ繧ｵ繝繝阪う繝ｫ繝ｻ繝輔Ο繝ｼ繝√Ε繝ｼ繝茨ｼ峨ｒROADMAP縺ｫ險倬鹸縲・
- 2026-05-02: 蜿ｳ繝壹う繝ｳ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ髢矩哩迥ｶ諷九・ LocalStorage 豌ｸ邯壼喧繧貞ｮ溯｣・ゅく繝ｼ縺ｯ `talking.editor.rightPaneSections.v1` 繧呈治逕ｨ縺励・壼ｸｸ陦ｨ遉ｺ/蜈ｨ逕ｻ髱｢陦ｨ遉ｺ縺ｧ蜷御ｸ迥ｶ諷九ｒ蜈ｱ譛峨ゆｿ晏ｭ伜､遐ｴ謳肴凾縺ｮ譌｢螳壼､繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縺ｨ縲∵眠隕上く繝ｼ霑ｽ蜉譎ゅ・譌｢螳壼､陬懷ｮ後ｒ霑ｽ蜉縲ゅす繝翫Μ繧ｪ繧ｨ繧ｯ繧ｹ繝昴・繝・繧､繝ｳ繝昴・繝茨ｼ・SON 竊・蟆・擂逧・↓AI蜷代￠Markdown/DSL・峨ｒ蟆・擂隱ｲ鬘後→縺励※譏手ｨ倥・
- 2026-05-02: 繧ｲ繝ｼ繝邱ｨ髮・判髱｢縺ｧ譛蠕後↓驕ｸ謚槭＠縺溘す繝ｼ繝ｳ/繝弱・繝峨・菴懈･ｭ菴咲ｽｮ蠕ｩ蜈ギVP繧貞ｮ溯｣・Ａtalking.editor.lastSelection.v1:${gameId}` 縺ｫ `sceneId` / `nodeId` / `updatedAt` 繧剃ｿ晏ｭ倥＠縲∝・險ｪ譎ゅ↓蠕ｩ蜈・ゆｿ晏ｭ伜､遐ｴ謳阪・蜑企勁貂医∩蜿ら・譎ゅ・螳牙・縺ｫ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縺励∝承繝壹う繝ｳ髢矩哩迥ｶ諷九く繝ｼ・・talking.editor.rightPaneSections.v1`・峨→縺ｯ蛻・屬邂｡逅・・
- 2026-05-02: 菴懈･ｭ菴咲ｽｮ蠕ｩ蜈ギVP縺ｮ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ蠑ｷ蛹悶ゆｿ晏ｭ伜､縺ｪ縺励・繝代・繧ｹ螟ｱ謨励・蜑企勁貂医∩蜿ら・縺ｮ縺・★繧後・蝣ｴ蜷医ｂ縲～GameProject.startSceneId` 竊・蜈磯ｭ繧ｷ繝ｼ繝ｳ 竊・`startNodeId` 竊・蜈磯ｭ繝弱・繝峨・鬆・〒蛻晄悄驕ｸ謚槭＆繧後ｋ繧医≧ `selectInitialSceneAndNode()` 繧定ｿｽ蜉縲ＡrestoreLastSelection()` 縺・`Promise<boolean>` 繧定ｿ斐＠縲～false` 縺ｮ蝣ｴ蜷医↓蛻晄悄驕ｸ謚槭∈繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縲ＡgetSavedLastSelection` 縺ｧ繝代・繧ｹ螟ｱ謨励・遨ｺ蛟､譎ゅ↓ localStorage 縺ｮ蜿､縺・､繧貞炎髯､縲・
- 2026-05-03: 繧ｲ繝ｼ繝蜈ｬ髢句燕繝√ぉ繝・けMVP繧貞ｮ溯｣・ＡrunScenarioCheck` 繧貞・騾壼喧縺励～/my/games` 縺ｮ蜈ｬ髢区桃菴懊〒 `error` 繧貞・髢倶ｸ榊庄縲～warning` 縺ｯ遒ｺ隱榊ｾ悟・髢句庄縲～info` 縺ｮ縺ｿ/蝠城｡後↑縺励・蜈ｬ髢句庄縺ｫ邨ｱ荳縲Ａerror` 譎ゅ・ edit逕ｻ髱｢縺ｮ繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け縺ｸ隱伜ｰ趣ｼ医け繧ｨ繝ｪ縺ｧ繧ｨ繝ｩ繝ｼ繝輔ぅ繝ｫ繧ｿ蛻晄悄陦ｨ遉ｺ・峨・PI蛛ｴ蜈ｬ髢句ｯｩ譟ｻ縺ｯ蟆・擂隱ｲ鬘後→縺励※邯ｭ謖√・
- 2026-05-03: 繧ｲ繝ｼ繝繝励Ξ繧､逕ｻ髱｢縺ｫ BGM 繝輔ぉ繝ｼ繝峨う繝ｳ/繝輔ぉ繝ｼ繝峨い繧ｦ繝・VP繧貞ｮ溯｣・ＡmusicAssetId` 螟画峩譎ゅ↓縲梧立譖ｲ繝輔ぉ繝ｼ繝峨い繧ｦ繝遺・譁ｰ譖ｲ繝輔ぉ繝ｼ繝峨う繝ｳ縲阪ｒ逶ｴ蛻怜ｮ溯｡後＠縲∝酔荳BGM縺ｯ蜀崎ｪｭ縺ｿ霎ｼ縺ｿ縺帙★邯咏ｶ壼・逕溘ＡmusicAssetId` 譛ｪ謖・ｮ壽凾縺ｯ迴ｾ陦御ｻ墓ｧ倥ｒ邯ｭ謖√＠縺ｦ蛛懈ｭ｢謇ｱ縺・ｼ医ヵ繧ｧ繝ｼ繝峨い繧ｦ繝育ｵ檎罰・峨４E縺ｯMVP縺ｨ縺励※譌｢蟄俶嫌蜍慕ｶｭ謖√・UTO/SKIP鬮倬滄・遘ｻ譎ゅ・遶ｶ蜷医ｒ驕ｿ縺代ｋ縺溘ａ繝輔ぉ繝ｼ繝牙・逅・↓荳紋ｻ｣繝医・繧ｯ繝ｳ邂｡逅・ｒ蟆主・縲・
- 2026-05-03: 繧ｷ繝翫Μ繧ｪ繝√ぉ繝・け霑ｽ蜉MVP繧貞ｮ溯｣・よ里蟄倥メ繧ｧ繝・け縺ｫ蜉縺医※縲後ヮ繝ｼ繝画悽譁・′遨ｺ縲阪碁∈謚櫁い繝ｩ繝吶Ν縺檎ｩｺ縲阪瑚｡ｨ遉ｺ蜿ｯ閭ｽ縺ｪ驕ｸ謚櫁い縺・莉ｶ縺ｮ繝弱・繝峨阪碁幕蟋九す繝ｼ繝ｳ莉･螟悶・螢翫ｌ縺・startNodeId縲阪ｒ warning 縺ｨ縺励※讀懷・縲・PI蛛ｴ蜈ｬ髢九ヶ繝ｭ繝・け縺ｫ縺ｯ霑ｽ蜉縺励↑縺・Ｗitest 縺ｫ21繧ｱ繝ｼ繧ｹ縺ｮ繝・せ繝医ｒ霑ｽ蜉・・ files / 31 tests 蜈ｨ騾夐℃・峨らｴ譚仙盾辣ｧ縺ｮ蜴ｳ蟇・メ繧ｧ繝・け縺ｯ蟆・擂隱ｲ鬘後→縺励※險倬鹸縲・
- 2026-05-03: 蜈ｬ髢九ご繝ｼ繝荳隕ｧ `/games` 縺ｮ讀懃ｴ｢繝ｻ荳ｦ縺ｳ譖ｿ縺・VP繧貞ｮ溯｣・Ａq`・・itle/summary 驛ｨ蛻・ｸ閾ｴ・峨→ `sort`・・new|updated|title`・峨ｒ URL 繧ｯ繧ｨ繝ｪ蜷梧悄縺励∫ｩｺ逋ｽ讀懃ｴ｢縺ｮ辟｡蜉ｹ蛹悶・荳肴ｭ｣sort縺ｮ豁｣隕丞喧繝ｻ讀懃ｴ｢0莉ｶ譎らｩｺ迥ｶ諷玖｡ｨ遉ｺ繧定ｿｽ蜉縲ＡGET /games` 縺ｯ `q` / `sort` 繧貞女縺大叙繧・API 蛛ｴ縺ｧ蜈ｬ髢九ご繝ｼ繝讀懃ｴ｢繝ｻ繧ｽ繝ｼ繝医ｒ螳滓命縲・
- 2026-05-03: 蜈ｬ髢九ご繝ｼ繝髢ｲ隕ｧ謨ｰ/繝励Ξ繧､謨ｰ縺ｮ髮・ｨ・VP繧貞ｮ溯｣・ＡGameProject` 縺ｫ `viewCount` / `playCount` 繧定ｿｽ蜉縺励∬ｩｳ邏ｰ逕ｻ髱｢繧ｪ繝ｼ繝励Φ譎ゅ・ `POST /games/:id/view`縲√・繝ｬ繧､逕ｻ髱｢繧ｪ繝ｼ繝励Φ譎ゅ・ `POST /games/:id/play` 縺ｧ繧ｫ繧ｦ繝ｳ繝医ょ・髢倶ｸ隕ｧ/隧ｳ邏ｰ縺ｫ繧ｫ繧ｦ繝ｳ繧ｿ陦ｨ遉ｺ繧定ｿｽ蜉縲る㍾隍・勁螟悶・莠ｺ豌鈴・繝励Ξ繧､謨ｰ鬆・た繝ｼ繝医・莉雁屓譛ｪ螳溯｣・→縺励※蟆・擂隱ｲ鬘後∈謨ｴ逅・ゅち繧ｰ/繧ｸ繝｣繝ｳ繝ｫ讖溯・縺ｮ蟆・擂隱ｲ鬘後ｂ霑ｽ險倥・

- 2026-05-05: プロフィール/クリエイター名MVPを実装。CreatorProfile テーブル (creator_profiles) を追加し、ログインユーザーが PATCH /my/profile で表示名(40文字以内)と自己紹介(500文字以内)を設定可能。GET /my/profile で自分のプロフィールを取得(未設定時は isConfigured: false を返却)。GET /profiles/:userId で公開プロフィールを取得(email等の個人情報は返さない)。GET /games / GET /games/:id / GET /games/:id/credits にそれぞれ ownerDisplayName フィールドを追加。フロントは ormatCreatorLabel(ownerDisplayName, ownerId) で表示名優先・未設定時は短縮ownerIdフォールバック。/my/profile ページを追加し、アプリヘッダーに「プロフィール」リンクを追加。
