import { Canvas, Group, Picture } from '@shopify/react-native-skia';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { C, FONT, MAX_CHARS, MAX_LINES, MAX_WATER, T } from '@/lib/constants';
import { getSprites } from '@/lib/pixel';

// ===== 文字 =====
export function Txt({ style, ...p }: TextProps) {
  return <Text {...p} style={[s.txt, style]} />;
}
export const Small = ({ style, ...p }: TextProps) => <Txt {...p} style={[s.small, style]} />;
export const P = ({ style, ...p }: TextProps) => <Txt {...p} style={[s.p, style]} />;
export const H2 = ({ style, ...p }: TextProps) => <Txt {...p} style={[s.h2, style]} />;
// 試作の <b>（DotGothic16 には太字がないので、少し濃くして目立たせる）
export const B = ({ children }: { children: ReactNode }) => <Text style={s.b}>{children}</Text>;

// ===== ボタン（下に影のある押せる感じ） =====
type BtnKind = 'main' | 'sub' | 'warn';
export function Btn({
  title,
  onPress,
  kind = 'main',
  disabled,
  style,
}: {
  title: string;
  onPress?: () => void;
  kind?: BtnKind;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const shadow = kind === 'warn' ? C.warnD : C.mossD;
  const bg = kind === 'main' ? C.moss : kind === 'warn' ? C.warn : C.paper;
  const fg = kind === 'sub' ? C.ink : C.paper;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[disabled && { opacity: 0.45 }, style]}>
      {({ pressed }) => {
        const down = pressed && !disabled;
        return (
          <View style={[s.btnShadow, { backgroundColor: shadow, marginTop: down ? 2 : 0, paddingBottom: down ? 1 : 3 }]}>
            <View style={[s.btn, { backgroundColor: bg, borderColor: shadow }]}>
              <Txt style={[s.btnText, { color: fg }]}>{title}</Txt>
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

// ヘッダーの小さなボタン
export function HBtn({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={4}>
      {({ pressed }) => (
        <View style={[s.btnShadow, { backgroundColor: C.mossD, marginTop: pressed ? 2 : 0, paddingBottom: pressed ? 1 : 3 }]}>
          <View style={[s.hbtn]}>
            <Txt style={s.hbtnText}>{title}</Txt>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function LinkBtn({ title, onPress, style }: { title: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={[{ padding: 4 }, style]} hitSlop={6}>
      <Txt style={s.link}>{title}</Txt>
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.row, style]}>{children}</View>;
}

// ===== 便箋 =====
const LINE_H = 32;
function Lines({ height }: { height: number }) {
  const n = Math.max(MAX_LINES, Math.floor(height / LINE_H));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[s.ruled, { top: i * LINE_H + LINE_H - 1 }]} />
      ))}
    </View>
  );
}

export function Letter({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const [h, setH] = useState(LINE_H * MAX_LINES);
  return (
    <View style={s.letterBox} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      <Lines height={h} />
      <Text style={[s.letter, style]}>{text}</Text>
    </View>
  );
}

// 3行・80字まで。プレースホルダーは出さない
export function LetterInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={[s.letterBox, { height: LINE_H * MAX_LINES }]}>
      <Lines height={LINE_H * MAX_LINES} />
      <TextInput
        value={value}
        onChangeText={(v) => {
          const lines = v.split('\n');
          if (lines.length > MAX_LINES) v = lines.slice(0, MAX_LINES).join('\n');
          if (v.length > MAX_CHARS) v = v.slice(0, MAX_CHARS);
          onChange(v);
        }}
        multiline
        autoFocus
        scrollEnabled={false}
        maxLength={MAX_CHARS}
        style={[s.letter, s.input]}
        textAlignVertical="top"
        selectionColor={C.moss}
        cursorColor={C.ink}
      />
    </View>
  );
}

// ===== 💧 =====
export function Drops({ n, center }: { n: number; center?: boolean }) {
  return (
    <View style={[s.drops, center && { justifyContent: 'center' }]}>
      {Array.from({ length: MAX_WATER }, (_, i) => (
        <Text key={i} style={[s.drop, i >= n && s.dropOff]}>
          💧
        </Text>
      ))}
    </View>
  );
}

// ===== 植物のドット絵アイコン =====
export function PlantIcon({ stage, flower, size = 48, radius = 4 }: { stage: number; flower: number; size?: number; radius?: number }) {
  const pic = getSprites().plants[stage * 8 + flower];
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: C.iconBg, overflow: 'hidden' }}>
      <Canvas style={{ width: size, height: size }}>
        <Group transform={[{ scale: size / T }]}>
          <Picture picture={pic} />
        </Group>
      </Canvas>
    </View>
  );
}
export function BigFlower({ stage, flower }: { stage: number; flower: number }) {
  return (
    <View style={{ alignSelf: 'center', marginTop: 4, marginBottom: 8 }}>
      <PlantIcon stage={stage} flower={flower} size={96} radius={8} />
    </View>
  );
}

const s = StyleSheet.create({
  txt: { fontFamily: FONT.ui, color: C.ink },
  small: { fontSize: 12, lineHeight: 20, opacity: 0.75 },
  p: { fontSize: 14, lineHeight: 24, marginVertical: 6 },
  h2: { fontSize: 18, lineHeight: 26, marginBottom: 10 },
  b: { color: '#1e180f', fontWeight: 'bold' },
  btnShadow: { borderRadius: 6 },
  btn: { borderWidth: 2, borderRadius: 6, paddingVertical: 9, paddingHorizontal: 16 },
  btnText: { fontSize: 15, lineHeight: 20 },
  hbtn: {
    backgroundColor: C.paper,
    borderColor: C.mossD,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  hbtnText: { fontSize: 13, lineHeight: 17 },
  link: { color: C.accentD, textDecorationLine: 'underline', fontSize: 13 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end', alignItems: 'center', marginTop: 14, flexWrap: 'wrap' },
  letterBox: { minHeight: LINE_H * MAX_LINES, paddingHorizontal: 4 },
  ruled: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: C.line },
  letter: { fontFamily: FONT.text, fontSize: 18, lineHeight: LINE_H, color: C.ink },
  input: { flex: 1, padding: 0, paddingTop: 0, margin: 0, includeFontPadding: false },
  drops: { flexDirection: 'row', gap: 6, marginTop: 10, marginBottom: 4 },
  drop: { fontSize: 22 },
  dropOff: { opacity: 0.25 },
});
