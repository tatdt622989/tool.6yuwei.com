import { describe, expect, it } from 'vitest';
import {
  dbToPercent,
  describeMediaError,
  detectEnv,
  deviceLabel,
  extensionForType,
  isClipping,
  levelVerdict,
  peakHold,
  peakOf,
  permissionHelp,
  pickRecorderType,
  recordingFilename,
  rmsOf,
  toDbfs,
} from './logic';
import { MEDIA_TEXT_EN, MEDIA_TEXT_JA } from './media-text';

describe('levels', () => {
  it('computes RMS and peak', () => {
    expect(rmsOf([])).toBe(0);
    expect(rmsOf([0.5, -0.5, 0.5, -0.5])).toBeCloseTo(0.5);
    expect(rmsOf([1, 0])).toBeCloseTo(Math.SQRT1_2);
    expect(peakOf([0.1, -0.8, 0.3])).toBeCloseTo(0.8);
    expect(peakOf(new Float32Array(0))).toBe(0);
  });

  it('converts amplitude to dBFS with clamping', () => {
    expect(toDbfs(1)).toBe(0);
    expect(toDbfs(0.5)).toBeCloseTo(-6.02, 1);
    expect(toDbfs(0.1)).toBeCloseTo(-20);
    expect(toDbfs(0)).toBe(-100);
    expect(toDbfs(Number.NaN)).toBe(-100);
    expect(toDbfs(2)).toBe(0);
  });

  it('maps dB to a meter percentage', () => {
    expect(dbToPercent(-100)).toBe(0);
    expect(dbToPercent(-60)).toBe(0);
    expect(dbToPercent(-30)).toBeCloseTo(50);
    expect(dbToPercent(0)).toBe(100);
    expect(dbToPercent(3)).toBe(100);
    expect(dbToPercent(-20, -40)).toBeCloseTo(50);
  });

  it('holds peaks and decays linearly', () => {
    expect(peakHold(-30, -10, 16)).toBe(-10);
    expect(peakHold(-10, -50, 1000, 15)).toBe(-25);
    expect(peakHold(-10, -12, 1000, 15)).toBe(-12);
    expect(peakHold(-10, -50, -5)).toBe(-10);
  });

  it('classifies levels', () => {
    expect(levelVerdict(-80)).toBe('silent');
    expect(levelVerdict(-45)).toBe('quiet');
    expect(levelVerdict(-20)).toBe('good');
    expect(levelVerdict(-3)).toBe('loud');
    expect(levelVerdict(-30, true)).toBe('loud');
    expect(isClipping(0.995)).toBe(true);
    expect(isClipping(0.9)).toBe(false);
  });
});

describe('recording', () => {
  it('picks the first supported type', () => {
    expect(pickRecorderType((t) => t === 'audio/mp4')).toBe('audio/mp4');
    expect(pickRecorderType(() => true)).toBe('audio/webm;codecs=opus');
    expect(pickRecorderType(() => false)).toBe('');
    expect(
      pickRecorderType(() => {
        throw new Error('x');
      }),
    ).toBe('');
  });

  it('derives extensions and filenames', () => {
    expect(extensionForType('audio/mp4')).toBe('m4a');
    expect(extensionForType('audio/ogg;codecs=opus')).toBe('ogg');
    expect(extensionForType('audio/webm;codecs=opus')).toBe('webm');
    expect(extensionForType('')).toBe('webm');
    expect(recordingFilename(new Date(2026, 0, 5, 9, 3, 7), 'audio/mp4')).toBe('mic-test-20260105-090307.m4a');
  });
});

describe('environment and errors', () => {
  const UA = {
    chromeWin:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    edgeWin:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
    safariMac:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    firefoxMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:131.0) Gecko/20100101 Firefox/131.0',
    iphone:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    android:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  };

  it('detects browser and platform', () => {
    expect(detectEnv(UA.chromeWin)).toEqual({ browser: 'chrome', platform: 'windows' });
    expect(detectEnv(UA.edgeWin)).toEqual({ browser: 'edge', platform: 'windows' });
    expect(detectEnv(UA.safariMac)).toEqual({ browser: 'safari', platform: 'mac' });
    expect(detectEnv(UA.safariMac, 5)).toEqual({ browser: 'safari', platform: 'ios' });
    expect(detectEnv(UA.firefoxMac)).toEqual({ browser: 'firefox', platform: 'mac' });
    expect(detectEnv(UA.iphone)).toEqual({ browser: 'safari', platform: 'ios' });
    expect(detectEnv(UA.android)).toEqual({ browser: 'chrome', platform: 'android' });
    expect(detectEnv('')).toEqual({ browser: 'other', platform: 'other' });
  });

  it('gives browser and OS specific permission steps', () => {
    const chrome = permissionHelp({ browser: 'chrome', platform: 'mac' }, 'mic');
    expect(chrome[0]).toContain('Chrome');
    expect(chrome[1]).toContain('系統設定');
    expect(chrome.join('')).toContain('麥克風');
    expect(permissionHelp({ browser: 'safari', platform: 'ios' }, 'camera').join('')).toContain('相機');
    expect(permissionHelp({ browser: 'firefox', platform: 'windows' }, 'mic')).toHaveLength(2);
    expect(permissionHelp({ browser: 'other', platform: 'other' }, 'mic')).toHaveLength(1);
  });

  it('maps getUserMedia errors', () => {
    expect(describeMediaError('NotAllowedError', 'mic').showPermissionHelp).toBe(true);
    expect(describeMediaError('NotFoundError', 'mic').title).toBe('找不到麥克風');
    expect(describeMediaError('NotReadableError', 'camera').detail).toContain('占用');
    expect(describeMediaError('OverconstrainedError', 'camera').detail).toContain('解析度');
    expect(describeMediaError('insecure', 'mic').title).toContain('HTTPS');
    expect(describeMediaError('unsupported', 'mic').showPermissionHelp).toBe(false);
    expect(describeMediaError('Weird', 'mic').detail).toContain('Weird');
  });

  it('labels unnamed devices', () => {
    expect(deviceLabel('', 0, 'mic')).toBe('麥克風 1');
    expect(deviceLabel('  USB Mic ', 2, 'mic')).toBe('USB Mic');
  });
});

describe('localized media text', () => {
  const winChrome = { browser: 'chrome', platform: 'windows' } as const;
  const iosSafari = { browser: 'safari', platform: 'ios' } as const;

  it('keeps the zh-TW wording unchanged by default', () => {
    expect(permissionHelp(winChrome, 'mic')).toEqual([
      'Chrome：點網址列左側的「查看網站資訊」圖示 → 將「麥克風」切換為允許，然後重新整理頁面。',
      'Windows：「設定」→「隱私權與安全性」→「麥克風」→ 開啟「麥克風存取權」與「讓桌面應用程式存取您的麥克風」。',
    ]);
    expect(describeMediaError('OverconstrainedError', 'camera').detail).toBe(
      '選定的裝置已不存在，或不支援要求的設定。請在選單改選其他裝置或改用較低解析度再試一次。',
    );
    expect(describeMediaError('OverconstrainedError', 'mic').detail).toBe(
      '選定的裝置已不存在，或不支援要求的設定。請在選單改選其他裝置再試一次。',
    );
    expect(describeMediaError('', 'mic').detail).toBe('發生未預期的錯誤（未知）。請重新整理頁面，或改用其他瀏覽器再試一次。');
    expect(describeMediaError('NotReadableError', 'camera').detail).toContain('（例如 LINE、Teams、Zoom、Google Meet 或 OBS）');
    expect(deviceLabel('', 0, 'camera')).toBe('相機 1');
  });

  it('fills English templates with sentence-case names', () => {
    expect(describeMediaError('NotAllowedError', 'mic', MEDIA_TEXT_EN)).toEqual({
      title: 'Microphone access was blocked',
      detail:
        'Your browser or operating system blocked this site from using the microphone. Allow it with the steps below, then press Start again.',
      showPermissionHelp: true,
    });
    const steps = permissionHelp(winChrome, 'camera', MEDIA_TEXT_EN);
    expect(steps[1]).toBe(
      'Windows 11: Settings > Privacy & security > Camera, then turn on “Camera access” and “Let desktop apps access your camera”.',
    );
    expect(describeMediaError('Weird', 'mic', MEDIA_TEXT_EN).detail).toContain('(Weird)');
    expect(deviceLabel(' ', 1, 'mic', MEDIA_TEXT_EN)).toBe('Microphone 2');
  });

  it('fills Japanese templates', () => {
    expect(permissionHelp(iosSafari, 'mic', MEDIA_TEXT_JA)).toHaveLength(2);
    expect(permissionHelp({ browser: 'chrome', platform: 'mac' }, 'camera', MEDIA_TEXT_JA)[1]).toBe(
      'macOS：「システム設定」→「プライバシーとセキュリティ」→「カメラ」で、ブラウザをオンにします（変更後はブラウザの再起動が必要な場合があります）。',
    );
    expect(describeMediaError('OverconstrainedError', 'camera', MEDIA_TEXT_JA).detail).toContain('別のデバイスを選んで（または解像度を下げて）、');
    expect(describeMediaError('OverconstrainedError', 'mic', MEDIA_TEXT_JA).detail).toContain('別のデバイスを選んで、');
    for (const text of [MEDIA_TEXT_EN, MEDIA_TEXT_JA]) {
      for (const name of ['NotFoundError', 'NotReadableError', 'insecure', 'unsupported', 'x']) {
        for (const kind of ['mic', 'camera'] as const) {
          const p = describeMediaError(name, kind, text);
          expect(p.title + p.detail).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });
});
