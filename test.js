const {
  MakeStruct,
  UINT8,
  UCHAR,
  UINT16,
  USHORT,
  UINT32,
  ULONG,
  FLOAT32,
  FLOAT64,
} = require('./makeCStruct.js');

const zxc = console.log;
const structA = [[UINT8, 'char', 1], [USHORT, 'short', 1]];
const structB = [[UINT8, 'char', 1], [USHORT, 'short', 1]];
const struct2 = [[structA, 'a', 1], [structB, 'b', 1]];
// const struct2 = [[0, 'a', 1], [0, 'b', 1]];
zxc('==========================');
const test = new MakeStruct(struct2);
test.a.char.set(0, 1);
test.a.short.set(0, 2);
test.b.char.set(0, 3);
test.b.short.set(0, 4);
zxc('==========================');
zxc(test.a.char.get(0));
zxc(test.a.short.get(0));
zxc(test.b.char.get(0));
zxc(test.b.short.get(0));
zxc('==========================');
zxc(test);
