import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, ZoomIn, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { pickAndRestore, shareBackup } from '@/lib/backup';
import { C, FLOWERS, FONT, MAX_CHARS, MAX_LINES, MAX_WATER, WATER_MS } from '@/lib/constants';
import { jp, jpY } from '@/lib/date';
import { stageOf } from '@/lib/pixel';
import { maybeAskReview } from '@/lib/review';
import {
  canWater,
  deleteAll,
  plantSeed,
  pullSeed,
  setDayOffset,
  useFarm,
  waterSeed,
  type Seed,
} from '@/lib/store';
import { B, BigFlower, Btn, Drops, H2, Letter, LetterInput, LinkBtn, P, PlantIcon, Row, Small, Txt } from './ui';

export type Modal =
  | { type: 'plant'; x: number; y: number }
  | { type: 'planted' }
  | { type: 'seed'; id: number }
  | { type: 'watering'; id: number }
  | { type: 'watered'; id: number }
  | { type: 'bloomed'; id: number }
  | { type: 'book'; tab: 'bloom' | 'grow' }
  | { type: 'memory'; id: number; back?: boolean }
  | { type: 'help'; first?: boolean; sign?: boolean }
  | { type: 'settings' }
  | { type: 'import' }
  | { type: 'restored' };

// 外側をタップして閉じられないもの（試作の waterOv に出していたもの）
export const isLocked = (m: Modal) => m.type === 'watering' || m.type === 'watered' || m.type === 'bloomed';

type Nav = {
  open: (m: Modal) => void;
  close: () => void;
  goTo: (s: Seed) => void;
};

export function ModalHost({ modal, nav }: { modal: Modal; nav: Nav }) {
  const { height } = useWindowDimensions();
  const locked = isLocked(modal);
  return (
    <View style={[StyleSheet.absoluteFill, s.overlay]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={locked ? undefined : nav.close} accessible={false} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav} pointerEvents="box-none">
        <View style={[s.card, { maxHeight: height * 0.86 }]}>
          <ScrollView
            key={modal.type + ('tab' in modal ? modal.tab : '')}
            contentContainerStyle={s.cardInner}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Body modal={modal} nav={nav} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Body({ modal, nav }: { modal: Modal; nav: Nav }) {
  switch (modal.type) {
    case 'plant':
      return <PlantCard x={modal.x} y={modal.y} nav={nav} />;
    case 'planted':
      return <PlantedCard nav={nav} />;
    case 'seed':
      return <SeedCard id={modal.id} nav={nav} />;
    case 'watering':
      return <WateringCard id={modal.id} nav={nav} />;
    case 'watered':
      return <WateredCard id={modal.id} nav={nav} />;
    case 'bloomed':
      return <BloomedCard id={modal.id} nav={nav} />;
    case 'book':
      return <BookCard tab={modal.tab} nav={nav} />;
    case 'memory':
      return <MemoryCard id={modal.id} back={modal.back} nav={nav} />;
    case 'help':
      return <HelpCard first={modal.first} sign={modal.sign} nav={nav} />;
    case 'settings':
      return <SettingsCard nav={nav} />;
    case 'import':
      return <ImportCard nav={nav} />;
    case 'restored':
      return (
        <>
          <H2>✅ バックアップから戻しました</H2>
          <Row>
            <Btn title="OK" onPress={nav.close} />
          </Row>
        </>
      );
  }
}

const useSeed = (id: number) => useFarm().seeds.find((s) => s.id === id);
const Pop = ({ children }: { children: ReactNode }) => (
  <Animated.View entering={ZoomIn.duration(350).easing(Easing.out(Easing.quad))}>{children}</Animated.View>
);

// ===== 種を蒔く =====
function PlantCard({ x, y, nav }: { x: number; y: number; nav: Nav }) {
  const [text, setText] = useState('');
  const go = () => {
    const t = text.trim();
    if (!t) return;
    if (plantSeed(x, y, t)) nav.open({ type: 'planted' });
    else nav.close();
  };
  return (
    <>
      <H2>🌱 「できたこと」を植える</H2>
      <Small>どんなに小さなことでも大丈夫。</Small>
      <View style={{ height: 6 }} />
      <LetterInput value={text} onChange={setText} />
      <Txt style={s.counter}>
        {text.length} / {MAX_CHARS}字・{MAX_LINES}行まで
      </Txt>
      <Row>
        <Btn title="やめる" kind="sub" onPress={nav.close} />
        <Btn title="種を植える" onPress={go} disabled={!text.trim()} />
      </Row>
    </>
  );
}

function PlantedCard({ nav }: { nav: Nav }) {
  return (
    <Pop>
      <View style={s.center}>
        <BigFlower stage={0} flower={0} />
        <H2 style={s.tc}>種を植えました</H2>
        <P style={s.tc}>
          毎日1回、水やりをしながら{'\n'}今日のできたことを振り返ろう。{'\n'}
          {MAX_WATER}回水をあげると花が咲きます。
        </P>
        <Row style={s.rowCenter}>
          <Btn title="OK" onPress={nav.close} />
        </Row>
      </View>
    </Pop>
  );
}

// ===== 種を見る =====
function SeedCard({ id, nav }: { id: number; nav: Nav }) {
  const { today } = useFarm();
  const sd = useSeed(id);
  const [armed, setArmed] = useState(false);
  if (!sd) return null;
  const ok = canWater(sd, today);
  const last = sd.waters.length ? `最後の水やり：${jp(sd.waters[sd.waters.length - 1])}` : 'まだ水やりしていません';
  return (
    <>
      <H2>🌱 {jp(sd.planted)}に植えた種</H2>
      <Letter text={sd.text} />
      <Drops n={sd.waters.length} />
      <Small>
        水やり {sd.waters.length} / {MAX_WATER}・{last}
      </Small>
      {!ok && <P>今日はもう水やりしました。また明日、会いに来よう。</P>}
      <Row>
        <LinkBtn
          title={armed ? '本当に抜く？（もう一度タップ）' : 'この種を抜く'}
          style={{ marginRight: 'auto' }}
          onPress={() => {
            if (!armed) return setArmed(true);
            pullSeed(sd.id);
            nav.close();
          }}
        />
        <Btn title="閉じる" kind="sub" onPress={nav.close} />
        <Btn title="💧 水やりする" disabled={!ok} onPress={() => nav.open({ type: 'watering', id: sd.id })} />
      </Row>
    </>
  );
}

// ===== 水やり中（3秒・スキップできない） =====
function WateringCard({ id, nav }: { id: number; nav: Nav }) {
  const sd = useSeed(id);
  const [text] = useState(sd?.text ?? '');
  const p = useSharedValue(0);
  const bar = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  useEffect(() => {
    p.set(withTiming(1, { duration: WATER_MS, easing: Easing.linear }));
    const timer = setTimeout(() => {
      const after = waterSeed(id);
      if (!after) return nav.close();
      if (after.bloomed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        nav.open({ type: 'bloomed', id });
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        nav.open({ type: 'watered', id });
      }
    }, WATER_MS + 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  return (
    <View style={s.center}>
      <Small style={s.tc}>あなたの「できたこと」</Small>
      <Text style={s.wtext}>{text}</Text>
      <View style={s.bar}>
        <Animated.View style={[s.barFill, bar]} />
      </View>
      <Small style={[s.tc, { marginTop: 8, opacity: 0.7 }]}>💧 水をあげています…</Small>
    </View>
  );
}

function WateredCard({ id, nav }: { id: number; nav: Nav }) {
  const sd = useSeed(id);
  if (!sd) return null;
  return (
    <Pop>
      <View style={s.center}>
        <BigFlower stage={stageOf(sd)} flower={sd.flower} />
        <H2 style={s.tc}>水をあげました</H2>
        <Drops n={sd.waters.length} center />
        <P style={s.tc}>できたことに水やりしました。{'\n'}できていることがたくさんありますね。</P>
        <Row style={s.rowCenter}>
          <Btn title="OK" onPress={nav.close} />
        </Row>
      </View>
    </Pop>
  );
}

function BloomedCard({ id, nav }: { id: number; nav: Nav }) {
  const sd = useSeed(id);
  if (!sd) return null;
  return (
    <Pop>
      <View style={s.center}>
        <BigFlower stage={5} flower={sd.flower} />
        <H2 style={s.tc}>🌸 {FLOWERS[sd.flower].name}が咲きました！</H2>
        <P style={s.tc}>
          {jp(sd.planted)}の「できたこと」が花になりました。{'\n'}思い出帳にしまっておきます。
        </P>
        <Row style={s.rowCenter}>
          <Btn
            title="うれしい"
            onPress={() => {
              nav.close();
              // 開花の画面が閉じてから、評価のお願いを出す
              setTimeout(maybeAskReview, 500);
            }}
          />
        </Row>
      </View>
    </Pop>
  );
}

// ===== 思い出帳 =====
function Tab({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[s.tab, on && s.tabOn]} onPress={onPress}>
      <Txt style={[s.tabText, on && { color: C.paper }]}>{label}</Txt>
    </Pressable>
  );
}

function BookCard({ tab, nav }: { tab: 'bloom' | 'grow'; nav: Nav }) {
  const { seeds, today } = useFarm();
  const bl = seeds
    .filter((v) => v.bloomed)
    .sort((a, b) => (b.bloomed as string).localeCompare(a.bloomed as string) || b.id - a.id);
  const gr = seeds.filter((v) => !v.bloomed).sort((a, b) => a.id - b.id);
  return (
    <>
      <H2>📖 思い出帳</H2>
      <View style={s.tabs}>
        <Tab on={tab === 'bloom'} label={`咲いた花 ${bl.length}`} onPress={() => nav.open({ type: 'book', tab: 'bloom' })} />
        <Tab on={tab === 'grow'} label={`育てている種 ${gr.length}`} onPress={() => nav.open({ type: 'book', tab: 'grow' })} />
      </View>
      {tab === 'bloom' ? (
        bl.length ? (
          bl.map((v) => (
            <Pressable key={v.id} style={s.entry} onPress={() => nav.open({ type: 'memory', id: v.id, back: true })}>
              <PlantIcon stage={5} flower={v.flower} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={s.entryText}>{v.text}</Text>
                <Txt style={s.meta}>
                  {FLOWERS[v.flower].name}・{jp(v.planted)}に植えて {jp(v.bloomed as string)}に咲いた
                </Txt>
              </View>
            </Pressable>
          ))
        ) : (
          <Txt style={s.empty}>
            まだ花は咲いていません。{'\n'}種に{MAX_WATER}回水をあげると、ここに思い出が増えていきます。
          </Txt>
        )
      ) : gr.length ? (
        gr.map((v) => (
          <Pressable key={v.id} style={s.entry} onPress={() => nav.goTo(v)}>
            <PlantIcon stage={stageOf(v)} flower={v.flower} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={s.entryText}>{v.text}</Text>
              <Txt style={s.meta}>
                {jp(v.planted)}に植えた・水やり {v.waters.length}/{MAX_WATER}
                {canWater(v, today) ? (
                  <Text style={{ color: '#2f7fb8' }}>・今日まだ水やりできる</Text>
                ) : (
                  '・今日は済み'
                )}
              </Txt>
              <Txt style={s.meta}>タップでこの種のところへ行く</Txt>
            </View>
          </Pressable>
        ))
      ) : (
        <Txt style={s.empty}>育てている種はありません。{'\n'}マップで今日のできたことを植えてみよう。</Txt>
      )}
      <Row>
        <Btn title="閉じる" onPress={nav.close} />
      </Row>
    </>
  );
}

function MemoryCard({ id, back, nav }: { id: number; back?: boolean; nav: Nav }) {
  const sd = useSeed(id);
  if (!sd || !sd.bloomed) return null;
  return (
    <>
      <View style={s.center}>
        <BigFlower stage={5} flower={sd.flower} />
        <H2 style={s.tc}>{FLOWERS[sd.flower].name}</H2>
      </View>
      <Letter text={sd.text} />
      <Small style={{ marginTop: 12 }}>
        植えた日：{jpY(sd.planted)}
        {'\n'}水やりした日：{sd.waters.map(jp).join('・')}
        {'\n'}咲いた日：{jpY(sd.bloomed)}
      </Small>
      <Row>
        {back && <Btn title="思い出帳へ" kind="sub" onPress={() => nav.open({ type: 'book', tab: 'bloom' })} />}
        <Btn title="閉じる" onPress={nav.close} />
      </Row>
    </>
  );
}

// ===== あそびかた・看板 =====
function HelpBody() {
  const items: ReactNode[] = [
    <>
      画面をなぞった方向へ歩き（指を置いたままで歩き続けます）、草地や畑の上で <B>A</B> を押すと、<B>立っている場所</B>
      に今日の小さな「できたこと」を種として蒔けます。<B>道には蒔けません。</B>
    </>,
    <>
      種の上に立って <B>A</B> を押すと、いつでも見返せます。
    </>,
    <>
      水やりは<B>1つの種につき1日1回</B>。水をあげる間、そのできたことが3秒間表示されます。ゆっくり読んでみてください。
    </>,
    <>{MAX_WATER}回水をあげると花が咲き、マップに花が残ります。咲いた花は📖思い出帳でいつでも見返せます。</>,
  ];
  return (
    <>
      <View style={{ marginVertical: 6 }}>
        {items.map((it, i) => (
          <View key={i} style={s.li}>
            <Txt style={s.liNum}>{i + 1}.</Txt>
            <Txt style={s.liText}>{it}</Txt>
          </View>
        ))}
      </View>
      <Small>
        💧マークがついている種は、今日まだ水やりできる種です。{'\n'}データはこのスマホの中だけに保存され、どこにも送られません。
      </Small>
    </>
  );
}

function HelpCard({ first, sign, nav }: { first?: boolean; sign?: boolean; nav: Nav }) {
  return (
    <>
      <H2>{sign ? '🪧 看板' : '🌼 できたこと農園へようこそ'}</H2>
      <P>小さな「できたこと」を種にして、毎日の水やりで振り返り、自分の農園に花を咲かせていくアプリです。</P>
      <HelpBody />
      <Row>
        <Btn title={first ? 'はじめる' : '閉じる'} onPress={nav.close} />
      </Row>
    </>
  );
}

// ===== 設定 =====
function SettingsCard({ nav }: { nav: Nav }) {
  const { today, dayOffset } = useFarm();
  const [armed, setArmed] = useState(false);
  const [msg, setMsg] = useState('');
  return (
    <>
      <H2>⚙ 設定</H2>
      <Row style={s.rowStart}>
        <Btn title="あそびかた" kind="sub" onPress={() => nav.open({ type: 'help' })} />
      </Row>
      <Small style={{ marginTop: 14 }}>
        データはこのスマホの中にだけ保存されています。アプリの削除や機種変更で消えるので、ときどきバックアップを保存しておくと安心です。
      </Small>
      <Row style={s.rowStart}>
        <Btn
          title="バックアップを保存"
          kind="sub"
          onPress={() => {
            setMsg('');
            shareBackup().catch(() => setMsg('⚠ バックアップを書き出せませんでした。'));
          }}
        />
        <Btn title="バックアップから戻す" kind="sub" onPress={() => nav.open({ type: 'import' })} />
      </Row>
      {!!msg && <Small style={{ marginTop: 6 }}>{msg}</Small>}
      <Row style={s.rowStart}>
        <Btn
          title={armed ? '本当に削除する？（もう一度タップ）' : 'すべてのデータを削除'}
          kind="warn"
          onPress={() => {
            if (!armed) return setArmed(true);
            deleteAll();
            nav.close();
          }}
        />
      </Row>
      {__DEV__ && (
        <View style={s.debug}>
          <Small>
            お試し用：日付を進めて、水やり〜開花までを今すぐ試せます。{'\n'}現在の日付扱い：{jpY(today)}
            {dayOffset ? `（+${dayOffset}日）` : ''}
          </Small>
          <Row style={s.rowStart}>
            <Btn title="日付を1日進める" kind="sub" onPress={() => setDayOffset(dayOffset + 1)} />
            <Btn title="本当の日付に戻す" kind="sub" disabled={!dayOffset} onPress={() => setDayOffset(0)} />
          </Row>
        </View>
      )}
      <Row>
        <Btn title="閉じる" onPress={nav.close} />
      </Row>
    </>
  );
}

function ImportCard({ nav }: { nav: Nav }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <>
      <H2>バックアップから戻す</H2>
      <Small>保存しておいたバックアップのファイル（.json）を選んでください。今の農園は上書きされます。</Small>
      {!!msg && <Small style={{ marginTop: 8 }}>{msg}</Small>}
      <Row>
        <Btn title="戻る" kind="sub" onPress={() => nav.open({ type: 'settings' })} />
        <Btn
          title="ファイルを選ぶ"
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            setMsg('');
            try {
              if ((await pickAndRestore()) === 'ok') nav.open({ type: 'restored' });
            } catch {
              setMsg('⚠ 読み込めませんでした。できたこと農園のバックアップファイルか確認してください。');
            } finally {
              setBusy(false);
            }
          }}
        />
      </Row>
    </>
  );
}

const s = StyleSheet.create({
  overlay: { backgroundColor: 'rgba(30,38,22,0.6)', zIndex: 10 },
  kav: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: C.paper,
    borderColor: C.mossD,
    borderWidth: 3,
    borderRadius: 8,
    boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
  },
  cardInner: { paddingTop: 18, paddingHorizontal: 18, paddingBottom: 16 },
  center: { alignItems: 'stretch' },
  tc: { textAlign: 'center' },
  rowCenter: { justifyContent: 'center' },
  rowStart: { justifyContent: 'flex-start' },
  counter: { textAlign: 'right', fontSize: 12, opacity: 0.7, marginTop: 4 },
  wtext: {
    fontFamily: FONT.text,
    fontSize: 22,
    lineHeight: 37,
    color: C.ink,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 22,
    marginHorizontal: 4,
  },
  bar: { height: 12, backgroundColor: C.paperD, borderColor: C.mossD, borderWidth: 2, borderRadius: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.water },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tab: { flex: 1, padding: 8, borderWidth: 2, borderColor: C.mossD, borderRadius: 6, backgroundColor: C.paperD, alignItems: 'center' },
  tabOn: { backgroundColor: C.moss },
  tabText: { fontSize: 14 },
  entry: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 10,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: '#fbf7ea',
  },
  entryText: { fontFamily: FONT.text, fontSize: 15, lineHeight: 24, color: C.ink },
  meta: { fontSize: 11, lineHeight: 16, opacity: 0.7, marginTop: 2 },
  empty: { textAlign: 'center', fontSize: 13, lineHeight: 22, opacity: 0.7, paddingVertical: 24 },
  li: { flexDirection: 'row', marginBottom: 2 },
  liNum: { width: 20, fontSize: 14, lineHeight: 25 },
  liText: { flex: 1, fontSize: 14, lineHeight: 25 },
  debug: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: C.line, marginTop: 14, paddingTop: 10 },
});
