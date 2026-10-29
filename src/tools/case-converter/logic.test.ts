import { describe, expect, it } from 'vitest';
import { convertCase, isCaseStyle, splitWords, toggleCase, toSentenceCase, toTitleCase } from './logic';

describe('splitWords', () => {
  it('splits on separators, camel humps and acronyms', () => {
    expect(splitWords('hello world')).toEqual(['hello', 'world']);
    expect(splitWords('user_id-value.name/path')).toEqual(['user', 'id', 'value', 'name', 'path']);
    expect(splitWords('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request']);
    expect(splitWords('getUserID2Name')).toEqual(['get', 'User', 'ID2', 'Name']);
    expect(splitWords('  --  ')).toEqual([]);
  });
});

describe('identifier styles', () => {
  const input = 'Hello world, my-name_is XMLParser';
  it('converts to each style', () => {
    expect(convertCase(input, 'camel')).toBe('helloWorldMyNameIsXmlParser');
    expect(convertCase(input, 'pascal')).toBe('HelloWorldMyNameIsXmlParser');
    expect(convertCase(input, 'snake')).toBe('hello_world_my_name_is_xml_parser');
    expect(convertCase(input, 'kebab')).toBe('hello-world-my-name-is-xml-parser');
    expect(convertCase(input, 'constant')).toBe('HELLO_WORLD_MY_NAME_IS_XML_PARSER');
  });

  it('round-trips between identifier styles', () => {
    expect(convertCase('userAccountId', 'snake')).toBe('user_account_id');
    expect(convertCase('user_account_id', 'camel')).toBe('userAccountId');
    expect(convertCase('USER_ACCOUNT_ID', 'kebab')).toBe('user-account-id');
  });

  it('works line by line and keeps line breaks', () => {
    expect(convertCase('first name\nlast name\r\n\nage', 'snake')).toBe('first_name\nlast_name\r\n\nage');
  });

  it('keeps non-Latin words', () => {
    expect(convertCase('使用者 name', 'kebab')).toBe('使用者-name');
  });
});

describe('simple styles', () => {
  it('upper, lower and toggle', () => {
    expect(convertCase('Hello World', 'upper')).toBe('HELLO WORLD');
    expect(convertCase('Hello World', 'lower')).toBe('hello world');
    expect(toggleCase('Hello World 中文')).toBe('hELLO wORLD 中文');
  });

  it('handles empty input', () => {
    for (const style of ['upper', 'title', 'sentence', 'camel', 'toggle'] as const) expect(convertCase('', style)).toBe('');
  });
});

describe('toTitleCase', () => {
  it('capitalizes major words and keeps minor words lowercase', () => {
    expect(toTitleCase('the lord of the rings')).toBe('The Lord of the Rings');
    expect(toTitleCase('what are you looking for')).toBe('What Are You Looking For');
  });

  it('capitalizes after a subtitle colon', () => {
    expect(toTitleCase('star wars: a new hope')).toBe('Star Wars: A New Hope');
  });

  it('keeps acronyms and inner capitals in mixed text', () => {
    expect(toTitleCase('learn HTML on your iPhone')).toBe('Learn HTML on Your iPhone');
  });

  it('lowercases text written entirely in capitals', () => {
    expect(toTitleCase('HELLO THERE WORLD')).toBe('Hello There World');
  });

  it('handles each line separately', () => {
    expect(toTitleCase('a tale\nof two cities')).toBe('A Tale\nOf Two Cities');
  });
});

describe('toSentenceCase', () => {
  it('capitalizes sentence starts only', () => {
    expect(toSentenceCase('HELLO WORLD. THIS IS A TEST! ok?')).toBe('Hello world. This is a test! Ok?');
  });

  it('fixes the pronoun I and keeps file names intact', () => {
    expect(toSentenceCase('yes i think so. open file.txt now')).toBe('Yes I think so. Open file.txt now');
    expect(toSentenceCase('use i.e. or e.g. here')).toBe('Use i.e. or e.g. here');
  });

  it('starts new lines with a capital', () => {
    expect(toSentenceCase('first line\nsecond line')).toBe('First line\nSecond line');
  });
});

describe('isCaseStyle', () => {
  it('validates stored values', () => {
    expect(isCaseStyle('snake')).toBe(true);
    expect(isCaseStyle('SNAKE')).toBe(false);
  });
});
