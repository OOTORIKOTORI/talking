# UI Text & Wording Analysis: Publishing Flow & Credits Display

## Summary
This document provides a comprehensive analysis of user-facing UI strings related to publishing games, editing published games, staff roll features, and credit displays in the "talking" project. Identifies redundant, confusing, or information-heavy wording patterns.

---

## 1. PUBLISHING FLOW: Initial Publish (Private → Public)

### Trigger: "公開中（クリックで非公開）" Button
**File:** [apps/frontend/pages/my/games/index.vue](apps/frontend/pages/my/games/index.vue#L86)
- Button label: `g.isPublic ? '公開中（クリックで非公開）' : '非公開（クリックで公開）'`
- Interactive button that toggles publish state

### Step 1: Scenario Check
When user clicks publish, system checks for **errors** in game structure. 

**Error Blocking (from togglePublic function):**
```
エラー${errorIssues.length}件のため公開できません
公開できません。公開前チェックでエラーが見つかりました。エラーを修正してから公開してください。

${error1}
${error2}
${error3}
ほか ${restCount} 件

公開前チェックを確認するため編集画面へ移動しますか？
```
[Line ~470-480 in index.vue](apps/frontend/pages/my/games/index.vue#L470)

**Issues:**
- ❌ "エラー${errorIssues.length}件のため公開できません" is redundant (says same thing twice in same dialog)
- ❌ Multiple error confirmations needed before user can act
- ✓ Information overload: Shows errors + asks to navigate + confirms block

### Step 2: Warning Dialog (Optional)
If warnings exist but NO errors, shows:
```
警告がありますが公開しますか？

${categoryLines}
構成: X件
素材参照: X件
キャラクター参照: X件

※ 参照診断の取得に失敗したため、素材/キャラクター参照の最新状態は確認できませんでした。
素材・キャラクター参照の警告がある場合、公開後に画像・音声・立ち絵などが表示されない可能性があります。
```
[Line ~486-500 in index.vue](apps/frontend/pages/my/games/index.vue#L486)

**Issues:**
- ❌ "警告がありますが公開しますか？" is vague - doesn't explain consequences
- ❌ Reference note appears conditionally - inconsistent messaging
- ❌ Long explanation about what could go wrong mixes with actual warnings

### Step 3: Credit Confirmation Modal
**File:** [apps/frontend/components/game/GameCreditConfirmModal.vue](apps/frontend/components/game/GameCreditConfirmModal.vue)
- **Header:** `公開前にクレジットを確認`
- **Description:** 
```
このゲームで使用している素材・キャラクター・手動クレジットの内容を確認してください。
公開すると、現在のクレジット情報が公開時点の記録として固定されます。
```
[Line 16-19](apps/frontend/components/game/GameCreditConfirmModal.vue#L16)

**Issues:**
- ⚠ "固定されます" is vague - doesn't explain WHY this is important
- ✓ Clearly shows three categories of credits

#### Subcomponents in Credit Modal:

**Status Warning Summary:**
```
⚠ 公開前に確認が必要そうな項目があります（削除済み・非公開など）。
```
[Line 44](apps/frontend/components/game/GameCreditConfirmModal.vue#L44)

**Button:** `編集画面で参照警告を確認`
[Line 49-55](apps/frontend/components/game/GameCreditConfirmModal.vue#L49)

**Asset/Character Status Badges:**
- `クレジット必須` (amber badge)
- `クレジット任意` (gray badge)
- `⚠ 削除済み` (red badge)
- `⚠ 見つかりません` (red badge)
- `⚠ 非公開` (orange badge - character only)

**Fix Hints:**
```
参照先の素材が見つかりません。該当ノードの背景/BGM/SE/立ち絵画像などを別素材に差し替えてください。
この素材は削除済みです。別の素材に差し替えてください。
この素材は現在利用できない状態です。別の素材に差し替えてください。
参照先のキャラクターが見つかりません。スピーカーまたは立ち絵設定を見直してください。
このキャラクターは削除済みです。別のキャラクターに差し替えてください。
このキャラクターは非公開です。公開キャラクターに差し替えるか、作者側の公開状態を確認してください。
```
[Lines 180-200 in GameCreditConfirmModal.vue](apps/frontend/components/game/GameCreditConfirmModal.vue#L180)

**Issues:**
- ❌ Fix hints are VERY prescriptive and long
- ❌ Most hints repeat the problem + solution pattern unnecessarily
- ✓ Clear technical guidance but too verbose for quick scanning

**Footer Buttons:**
- `キャンセル` button
- `確認して公開` button (enables on success, disabled during loading/error)

[Line 443-463](apps/frontend/components/game/GameCreditConfirmModal.vue#L443)

#### Credit Sections Inside Modal:

**Assets Section:**
```
素材
{{ data.counts.assets }}件

現在、このゲームで参照されている素材はありません。  (if empty)

Fields shown per asset:
- Title (with status badges)
- 作者: ${ownerDisplayName}
- 利用条件: (if exists)
- 個別条件なし (if no terms)
- 使用箇所: ${field}(${count}) / ...
```
[Lines 72-138](apps/frontend/components/game/GameCreditConfirmModal.vue#L72)

**Issues:**
- ⚠ "個別条件なし" and showing "個別条件" could be clearer
- ⚠ "使用箇所" (usage location) requires users to understand what fields mean

**Characters Section:**
Similar structure to assets with status badges

**Manual Credits Section:**
```
手動クレジット
{{ data.counts.manual }}件

手動クレジットはありません.  (if empty)

Per credit:
- label
- 種別/役割: ${manualRole} (if exists)
- (note, url if exists)
```
[Lines 213-242](apps/frontend/components/game/GameCreditConfirmModal.vue#L213)

---

## 2. EDITING PUBLISHED GAMES

### Notification Banner (Expanded)
**File:** [apps/frontend/pages/my/games/[id]/edit.vue](apps/frontend/pages/my/games/[id]/edit.vue)
```
このゲームは公開中です

保存した変更は公開版にも反映されます。新しく追加された素材・キャラクターのクレジットは、保存時に公開時点の情報として固定されます。

大きく作り直す場合は、必要に応じてゲーム一覧から非公開にしてから編集してください。
```
[Line ~2270](apps/frontend/pages/my/games/[id]/edit.vue#L2270)

**Issues:**
- ❌ Three separate lines of warning create information overload
- ❌ "公開時点の情報として固定" - still vague about consequences
- ❌ "大きく作り直す場合は..." is a recommendation mixed with warning

### Notification Banner (Collapsed)
```
公開中: 保存した変更は公開版に反映されます。
```

**Confirm Save Dialog (confirmSavePublishedGame)**
When saving a node on a published game:
```
このゲームは公開中です。
保存した変更は公開版にも反映されます。
新しく追加された素材・キャラクターのクレジットは保存時点の情報として固定されます。
保存を続行しますか？
```
[Lines 1084-1089 in edit.vue](apps/frontend/pages/my/games/[id]/edit.vue#L1084)

**Issues:**
- ❌ IDENTICAL text to banner, shown again as confirmation dialog
- ❌ "固定されます" appears twice with same ambiguous meaning
- ⚠ User must confirm EVERY save (potential friction)

### Scene Deletion Warning (Published Game)
```
このゲームは公開中です。
このシーンを削除すると、公開版の進行に影響する可能性があります。

シーン内ノードも削除され、外部参照は自動で解除されます。
削除しますか？
```
[Lines 1313-1324 in edit.vue](apps/frontend/pages/my/games/[id]/edit.vue#L1313)

**Additional context when available:**
```
削除されるノード数: X件
このシーンへの開始シーン参照: X件
シーン内ノードへの開始ノード参照: X件
シーン外ノードからのnextNode参照: X件
シーン外choiceからの遷移先参照: X件
シーン外choiceからの分岐遷移先参照: X件

これらの参照は削除時に自動で解除されます。
削除しますか？
```

**Issues:**
- ✓ Clear structure with impact + details
- ⚠ "nextNode参照" and "choice" terminology may confuse non-technical users
- ❌ Very long list of technical details before actual question

### Node Deletion Warning (Published Game)
```
このゲームは公開中です。
このノードを削除すると、公開版の進行や選択肢が壊れる可能性があります。

削除時に、開始ノードや遷移先として参照されている設定は自動で解除されます。
削除しますか？
```
[Lines 1221-1226 in edit.vue](apps/frontend/pages/my/games/[id]/edit.vue#L1221)

**Additional context when available:**
```
開始ノード参照: X件
nextNode参照: X件
choice遷移先参照: X件
choice分岐遷移先参照: X件

これらの参照は削除時に自動で解除されます。
```

**Issues:**
- ⚠ "nextNode参照" and "choice遷移先参照" are unclear to non-developers
- ❌ Technical jargon mixed with user-facing warning

### Start Scene/Node Change Warning (Published Game)
```
このゲームは公開中です。
開始シーンを変更すると、公開版の開始位置が変わります。
変更しますか？
```
[Lines 1417-1420 in edit.vue](apps/frontend/pages/my/games/[id]/edit.vue#L1417)

Similar for start node:
```
このゲームは公開中です。
開始ノードを変更すると、公開版の開始位置が変わります。
変更しますか？
```

**Issues:**
- ✓ Clear and concise
- ✓ Specific consequence stated

---

## 3. STAFF ROLL / CREDITS DISPLAY FEATURES

### Staff Roll Modal
**File:** [apps/frontend/components/game/GameStaffRollModal.vue](apps/frontend/components/game/GameStaffRollModal.vue)

**Header:**
```
スタッフロール
${gameTitle}

${playbackStatusLabel}
ホイール / タッチ操作で一時停止
```
[Lines 15-20](apps/frontend/components/game/GameStaffRollModal.vue#L15)

**Playback Status Labels:**
- `上映中` (when auto-scrolling)
- `一時停止中` (when paused)
- `終了` (when ended)

**Buttons:**
- `停止` / `再開` (toggles auto-scroll)
- `先頭へ` (scroll to top)
- `閉じる` (close)

**Credit Sections:**
```
手動クレジット
使用素材
使用キャラクター

該当なし  (if empty section)
```

**Per-item display:**
```
${title}
by ${ownerDisplayName}

利用条件 (if exists)
${usageTerms}

使用数: ${usageCount}  (for assets/characters)
```

**Issues:**
- ✓ Clean, minimal display
- ⚠ "使用数" (usage count) - unclear if this is important to viewers
- ⚠ "クレジット必須" badge shown in staff roll but meaning unclear to general audience

### Staff Roll Settings (in Global Settings Modal)
**File:** [apps/frontend/pages/my/games/[id]/edit.vue](apps/frontend/pages/my/games/[id]/edit.vue)

Location: "全体設定" (Global Settings) modal triggered by button in edit page

Likely contains:
- `staffRollEnabled` - toggle to enable/disable
- `staffRollAutoOpenEnabled` - toggle to auto-open on game end
- `staffRollSpeedPreset` - slow/normal/fast options

**Issues:**
- ⚠ Settings scattered in global settings modal (hard to find)
- ⚠ Not visible in pre-publish flow (users may forget these settings exist)

### Scenario Check Section (Pre-Publish)
**File:** [apps/frontend/pages/my/games/[id]/edit.vue](apps/frontend/pages/my/games/[id]/edit.vue#L1902)

```
公開前チェック
ゲーム構成・素材参照・キャラクター参照を確認します。警告は公開をブロックしません。

[折りたたむ / 展開]

エラー X件
警告 X件
情報 X件

素材・キャラクター参照を確認中...
参照診断の取得に失敗しました — 時間をおいて再読み込みしてください。
```

**Filter Buttons:**
```
すべて X件
エラー X件
警告 X件
情報 X件

全カテゴリ X件
構成 X件
素材参照 X件
キャラクター参照 X件
```

**Issue Details Format:**
```
${severity} · ${category}  [対象へ移動]

${message}

${location}
${nodePreview}
```

**Issues:**
- ✓ Good categorization system
- ✓ "警告は公開をブロックしません" clearly states behavior
- ❌ "情報" (info) category not visible by default (collapsed)
- ⚠ "公開前チェック" redundant - user already in pre-publish flow

---

## 4. SAVE/CONFIRM FLOWS

### Save Node Button
```
保存
保存して次のノードへ
```
Both disabled during save operation.

### Global Settings Modal
Triggered by `全体設定` button
Contains title, summary, cover asset, message theme, game UI theme, backlog theme, staff roll settings

**Issues:**
- ❌ Too many unrelated settings in one modal
- ⚠ Staff roll settings hidden in this modal (not discovered easily)

---

## 5. REDUNDANCY & CONSISTENCY ISSUES

### Key Redundancies Found:

1. **"公開中です" appears 4+ times:**
   - Edit banner (expanded & collapsed)
   - Save confirmation dialog
   - Delete confirmations (scene & node)
   - Start position change confirmation
   
   **→ Opportunities to consolidate or shorten**

2. **"クレジット情報が固定されます" stated 2 ways:**
   - Credit modal: "公開時点の記録として固定されます"
   - Edit page warning: "公開時点の情報として固定されます"
   - Save confirmation: "保存時点の情報として固定されます"
   
   **→ Terminology inconsistency ("記録" vs "情報" vs "時点" variations)**

3. **Warnings about changed references:**
   - Scene deletion mentions "外部参照は自動で解除"
   - Node deletion mentions "参照は削除時に自動で解除"
   
   **→ Different phrasing for same action**

4. **"nextNode参照" vs "choice遣移先参照" vs "choice分岐遷移先参照":**
   - Technical jargon not friendly to users
   - Inconsistent terminology in different warnings

### Terminology Inconsistencies:

| Issue | Current | Variations |
|-------|---------|-----------|
| Credit locking concept | "固定されます" | "記録として固定" / "情報として固定" |
| Using an asset/character | "使用" | "参照" (in diagnostics), "使用中" |
| Automatic cleanup | "自動で解除される" | "自動で解除されます" |
| Button reference design | "nextNode" | "nextNode遷移先", "通常遷移先" |
| Choice branches | "choice遷移先" | "choice分岐遷移先", "特別選択肢条件" |

---

## 6. INFORMATION OVERLOAD PATTERNS

### High-Density Dialogs:
1. **Error blocking dialog** - combines:
   - Toast error notification
   - Detailed error list (first 3 + count)
   - Navigation suggestion
   - Confirmation question

2. **Warning dialog before credit modal** - contains:
   - Warning header
   - Category breakdown
   - Conditional reference note
   - Consequence explanation
   - Confirmation question

3. **Credit modal status warning** - repeats:
   - Alert icon message
   - Edit navigation button
   - (redundant since modal already allows editing)

### Information Presentation Issues:
- Error/warning dialogs use `window.confirm()` (single OK/Cancel)
- Many details shown but limited ability to drill down
- User must navigate to edit page to see root causes
- No context for why specific warnings matter

---

## 7. UX FRICTION POINTS

### Friction Areas:
1. **Every save on published game requires confirmation**
   - Shown via `confirmSavePublishedGame()` 
   - Users may get confirmation fatigue
   
2. **Two-step publish (warnings → credits modal)**
   - Potential for users to abandon after seeing warnings
   
3. **Technical jargon in confirmations**
   - "nextNode参照", "choice遣移先参照" not self-explanatory
   - Requires users to understand game architecture
   
4. **Staff roll settings scattered**
   - Hidden in "全体設定" modal
   - Not visible in publish preview flow
   - Users may not discover feature

5. **Fix hints are prescriptive**
   - Very long explanations
   - Each broken asset/character gets separate hint
   - No copy/paste or quick action

---

## 8. KEY FINDINGS SUMMARY

### Strengths ✓
- Clear separation of error vs warning
- Specific guidance for fixing issues
- Staff roll display is clean and minimal
- Credit categorization (manual/assets/characters) is logical

### Weaknesses ❌
- High redundancy across dialogs
- Inconsistent terminology for same concepts
- Information overload in decision dialogs
- Technical jargon mixed with user-facing text
- Save confirmation every time (friction)

### Ambiguities ⚠
- "固定されます" - unclear impact on users
- "削除済み/非公開" - unclear what user should do
- "参照" vs "使用" - same concept, different words
- Why credit lock is necessary not explained

---

## 9. RECOMMENDATIONS FOR IMPROVEMENT

### Priority 1: Reduce Redundancy
- Consolidate "公開中です" messages
- Use consistent terminology for credit freezing
- Standardize deletion/reference cleanup language

### Priority 2: Clarify Ambiguous Terms
- Replace "固定されます" with clearer explanation
- Standardize "参照" vs "使用" vocabulary
- Explain WHY credit locking matters

### Priority 3: Reduce Information Overload
- Simplify warning dialogs
- Use collapsible/expandable sections
- Show most important info first

### Priority 4: Reduce Friction
- Consider single confirmation for save on published games
- Consolidate publish flow steps
- Surface staff roll settings earlier

### Priority 5: Technical Language Review
- Replace "nextNode参照" with "ノード遷移" or similar
- Clarify "choice遣移先参照" terminology
- Add glossary or tooltips for technical terms

---

## File References

| Concept | File | Lines |
|---------|------|-------|
| Publish toggle button | index.vue | ~86 |
| Scenario check & warnings | index.vue | ~470-500 |
| Credit modal | GameCreditConfirmModal.vue | ~1-463 |
| Edit page banner | [id]/edit.vue | ~2270-2300 |
| Save confirmation | [id]/edit.vue | ~1084-1089 |
| Deletion warnings | [id]/edit.vue | ~1221-1400 |
| Staff roll display | GameStaffRollModal.vue | ~1-450 |
| Pre-publish checks | [id]/edit.vue | ~1902-2000 |

