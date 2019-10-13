'use strict';
module.exports.UINT8 = ['UINT8', 1];
module.exports.UCHAR = module.exports.UINT8;
module.exports.UINT16 = ['UINT16', 2];
module.exports.USHORT = module.exports.UINT16;
module.exports.UINT32 = ['UINT32', 4];
module.exports.ULONG = module.exports.UINT32;
module.exports.FLOAT32 = ['FLOAT32', 4];
module.exports.FLOAT64 = ['FLOAT64', 8];

const LITTLE_ENDIAN = true;
const BIG_ENDIAN = false;

//  [UCHAR, 'id', 1]がrow
const zxc = console.log;
// 複数の型
// 構造体 in 構造体のメモリ構造
// 配列アクセス →構造体の配列と型の配列

// structのプロパティ名称に合わせたgetter,setterを生成
// offsetStructArrayは構造体配列の時に何番目のものか*構造体size
function makeGetterAndSetter(_this, _struct, dataView, offsetStructArray) {
  // プロパティ名称取得
  for (let i = 0; i < _struct.length; i++) {
    const row = _struct[i];
    const name = row[1];
    const typeName = row[0][0];
    const length = row[2]; // 要素数
    const offset = row[3];
    const typeSize = row[0][1]; // 型サイズ

    if (typeof typeSize !== 'number') {
      // 構造体 in 構造体
      if (length > 1) {
        zxc('len:', length);
        _this[name] = [];
        for (let x = 0; x < length; x++) {
          _this[name].push({});
          makeGetterAndSetter(_this[name][x], row[0], dataView, x * getStcutSize(row[0]));
        }
      } else {
        _this[name] = {};
        makeGetterAndSetter(_this[name], row[0], dataView, 0);
      }
      continue;
    }
    // additionalOffsetNumberは配列のときの要素の番号 バイト数じゃない
    _this[name] = {
      get: function(additionalOffsetNumber) {
        additionalOffsetNumber = additionalOffsetNumber * typeSize;
        additionalOffsetNumber += offsetStructArray;
        switch (typeName) {
          case 'UINT8':
            return dataView.getUint8(additionalOffsetNumber + offset);
          case 'UINT16':
            return dataView.getUint16(additionalOffsetNumber + offset, BIG_ENDIAN);
          case 'UINT32':
            return dataView.getUint32(additionalOffsetNumber + offset, BIG_ENDIAN);
          case 'FLOAT32':
            return dataView.getFloat32(additionalOffsetNumber + offset, BIG_ENDIAN);
          case 'FLOAT64':
            return dataView.getFloat64(additionalOffsetNumber + offset, BIG_ENDIAN);
        }
      },
      set: function(additionalOffsetNumber, val) {
        additionalOffsetNumber = additionalOffsetNumber * typeSize;
        additionalOffsetNumber += offsetStructArray;
        switch (typeName) {
          case 'UINT8':
            return dataView.setUint8(additionalOffsetNumber + offset, val);
          case 'UINT16':
            return dataView.setUint16(additionalOffsetNumber + offset, val, BIG_ENDIAN);
          case 'UINT32':
            return dataView.setUint32(additionalOffsetNumber + offset, val, BIG_ENDIAN);
          case 'FLOAT32':
            return dataView.setFloat32(additionalOffsetNumber + offset, val, BIG_ENDIAN);
          case 'FLOAT64':
            return dataView.setFloat64(additionalOffsetNumber + offset, val, BIG_ENDIAN);
        }
      },
    };
  }
}

function getStcutSize(_struct) {
  let size = 0;
  for (let x = 0; x < _struct.length; x++) {
    size += _struct[x][4];
  }
  return size;
}

// 構造体の先頭からのoffset及び、各構造体のサイズを[3][4]に追加する
function addSturctParams(_struct, _parentOffset) {
  let offset = _parentOffset;
  for (let i = 0; i < _struct.length; i++) {
    const row = _struct[i];
    // const name = row[1];
    const length = row[2]; // 要素数
    let typeSize = row[0][1]; // 型サイズ
    if (typeof typeSize !== 'number') {
      // 構造体 in 構造体
      const childStruct = row[0];
      addSturctParams(childStruct, offset);
      typeSize = getStcutSize(childStruct);
    }
    row[3] = offset;
    row[4] = typeSize * length;
    offset += row[4];
  }
  // zxc(name,_struct);
}

module.exports.MakeCStruct = class {
  constructor(_struct) {
    const clonedStruct = JSON.parse(JSON.stringify(_struct));
    addSturctParams(clonedStruct, 0);

    // バッファサイズの計算
    const lastRow = clonedStruct[clonedStruct.length - 1];
    this.bufferSize = lastRow[3] + lastRow[4];
    this.arraybuffer = new ArrayBuffer(this.bufferSize);
    this.dataView = new DataView(this.arraybuffer);
    // console.log('bufferSize', this.bufferSize);
    makeGetterAndSetter(this, clonedStruct, this.dataView, 0);
  }
};

// // stcutの定義方法[型名,名称,要素数,(構造体先頭からのオフセット),(その行のバイト数=要素数*型サイズ)]
// // ()内はaddSturctParams内で自動的に付加される
// // MakeStructに渡すstructは内部でクローンされる

// const structA = [[UINT8, 'char', 1], [USHORT, 'short', 1]];
// const structB = [[UINT8, 'char', 1], [USHORT, 'short', 1]];
// const struct2 = [[structA, 'a', 1], [structB, 'b', 1]];
// zxc('==========================');
// const test = new MakeStruct(struct2);
// test.a.char.set(0, 1);
// test.a.short.set(0, 2);
// test.b.char.set(0, 3);
// test.b.short.set(0, 4);
// zxc('==========================');
// zxc(test.a.char.get(0));
// zxc(test.a.short.get(0));
// zxc(test.b.char.get(0));
// zxc(test.b.short.get(0));
// zxc('==========================');
// zxc(test);
