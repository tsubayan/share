const { MakeCStruct, UINT8, UCHAR, uchar, UINT16, USHORT, ushort, UINT32, ULONG, ulong, FLOAT32, FLOAT64 } = require('./makeCStruct.js');

const zxc = console.log;
// const structA = [[UINT8, 'char', 10], [USHORT, 'short', 1]];
// const structB = [[UINT8, 'char', 1]];
// const struct2 = [[structA, 'a', 3], [structB, 'b', 1]];
// const struct2 = [[0, 'a', 1], [0, 'b', 1]];
const simple = [[ushort, 'id', 1], [uchar, 'name', 10]];

const innerdata = [[ushort, 'id', 1], [uchar, 'name', 10]];
const struct = [[innerdata, 'inner', 1], [ushort, 'id', 1], [innerdata, 'group', 5], [uchar, 'name', 10]];
// zxc('==========================');
const test = new MakeCStruct(struct);
const sim = new MakeCStruct(simple);
// // test.char[1].set(1);
// test.a[0].char.set(0, 1);
// test.a[1].char.set(0, 2);
// test.a[2].char.set(0, 3);
// test.a[2].char.set(1, 4);
// zxc(test);
// zxc(test.dataView.buffer);

// // test.a.char.set(0, 1);
// // test.a.short.set(0, 2);
// // test.b.char.set(0, 3);
// // test.b.short.set(0, 4);
// zxc('==========================');
// zxc(test.a[0].char.get(0));
// zxc(test.a[1].char.get(0));
// zxc(test.a[2].char.get(0));
// zxc(test.a[2].char.get(1));
// // zxc(test.b.short.get(0));
// zxc('==========================');

// const b = Buffer.alloc(10);
// zxc(b.length);
// for (let i = 0; i < b.length; i++) {
//     zxc(i, b.readUInt8(i));
// }
// zxc(test);
// test.setBuffer(b);
// zxc(test);
var net = require('net');

var server = net
  .createServer(function(conn) {
    console.log('server-> tcp server created');

    conn.on('data', function(data) {
      console.log(`受信`, data.length, data);
      test.setBuffer(data);
      zxc('id', test.id.get(0));
      zxc('name', test.getString(test.name, 'Shift-JIS'));
      zxc('inner id', test.inner.id.get(0));
      zxc('inner name', test.getString(test.inner.name, 'Shift-JIS'));
      zxc('g id', test.group[3].id.get(0));
      zxc('g name', test.getString(test.group[3].name, 'Shift-JIS'));
      // zxc(test.dataView);
      // zxc(test.getBuffer());
      sim.id.set(0, 1);
      sim.setString('テストテスト', sim.name, 'Shift-JIS');
      // sim.name.set(0, 0x30);
      conn.write(sim.getBuffer());
      // const bf = Buffer.from([0x30, 0x31, 0x32]);
      // conn.write(bf);
    });
    conn.on('close', function() {
      console.log('server-> client closed connection');
    });
  })
  .listen(12345);

console.log('listening on port 3000');
