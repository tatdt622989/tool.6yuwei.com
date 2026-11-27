// opencc-js ships these files through its "./*" export but without type declarations.
declare module 'opencc-js/from/hk' {
  import type { DictGroup } from 'opencc-js/core';
  const dicts: readonly DictGroup[];
  export default dicts;
}

declare module 'opencc-js/to/tw' {
  import type { DictGroup } from 'opencc-js/core';
  const dicts: readonly DictGroup[];
  export default dicts;
}

declare module 'opencc-js/to/twp' {
  import type { DictGroup } from 'opencc-js/core';
  const dicts: readonly DictGroup[];
  export default dicts;
}
