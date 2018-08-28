import base64 from 'base-64';
import utf8 from 'utf8';

const factory = {
    encode: t => base64.encode(utf8.encode(t)),
    decode: t => utf8.decode(base64.decode(t))
}

export default factory;