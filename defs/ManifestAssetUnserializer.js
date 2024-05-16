(() => {
	hxClasses = [], hxEnums = [];

	class HxOverrides{

		static strDate(s){
			switch(s.length){
				case 8:
					var k = s.split(':');
					var d = new Date();
					d.setTime(0);
					d.setUTCHours(k[0]);
					d.setUTCMinutes(k[1]);
					d.setUTCSeconds(k[2]);
					return d;
				case 10:
					var k = s.split('-');
					var d = new Date(k[0], k[1] - 1, k[2], 0, 0, 0);
				case 19:
					var k = s.split(' ');
					var y = k[0].split('-');
					var t = k[0].split(':');
					return new Date(y[0], y[1] - 1, y[2], t[0], t[1], t[2]);
				default:
					throw `Invalid date format ${s}`
			}
		}

	}

	hxClasses.HxOverrides = HxOverrides;
	HxOverrides.__name__ = "HxOverrides";

	class Reflect{

		static field(o, field){
			try{
				return o[field];
			}
			catch(e){
				return null;
			}
		}

		static isFunction(f){ return typeof(f) == "function" && !(f.__name__ || f.__ename__); }

	}

	hxClasses.Reflect = Reflect;
	Reflect.__name__ = "Reflect";

	class Type{

		static createEnum(e, constr, params){
			var f = Reflect.field(e, constr);
			if(f == null) throw `No such constructor ${constr}`;
			if(Reflect.isFunction(f)){
				if(params == null) throw `Constructor ${constr} need parameters`;
				f.apply(e, params);
			}
			if(params != null && params.length != 0) throw `Constructor ${constr} does not need parameters`;
			return f;
		}

	}

	hxClasses.Type = Type;
	Type.__name__ = "Type";

	class haxe_Unserializer{

		static DEFAULT_RESOLVER;
		static BASE64;
		static CODES;
		buf;
		pos;
		length;
		cache;
		scache;
		resolver;

		constructor(buf){
			this.buf = buf;
			this.length = buf.length;
			this.pos = 0;
			this.scache = [];
			this.cache = [];
			var r = haxe_Unserializer.DEFAULT_RESOLVER;
			if(r == null){
				r = new haxe__Unserializer_DefaultResolver();
				DEFAULT_RESOLVER = r;
			}
			this.resolver = r;
		}

		static initCodes(){
			var codes = [];
			for(var i = 0; i < BASE64.length; i++) codes[BASE64.charCodeAt(i)] = i;
			return codes;
		}

		static run(v){ return new haxe_Unserializer(v).unserialize(); }

		setResolver(r){
			if(r == null) this.resolver = haxe__Unserializer_NullResolver.instance;
			else this.resolver = r;
		}

		getResolver(){ return this.resolver; }

		get(p){ return this.buf.charCodeAt(p); }

		readDigits(){
			var k = 0, s = false, fpos = this.pos;
			var i = 0;
			while(true){
				var c = this.get(this.pos);
				if(c != c) break;
				if(c == 0x2D){ // -
					if(this.pos != fpos) break;
					s = true;
					this.pos++;
					continue;
				}
				if(c < 0x30 || c > 0x39) break; // 0-9
				k *= 10;
				k += c - 0x30;
				this.pos++;
				i++;
			}
			if(s) k *= -1;
			return k;
		}

		readFloat(){
			var pa = this.pos;
			while(true){
				var c = this.get(this.pos);
				if(c != c) break;
				if((c >= 0x2B && c < 0x3A) || c == 0x45 || c == 0x65) this.pos++;
				else break;
			}
			return parseFloat(buf.substr(p1, this.pos - p1));
		}

		unserialize(){
			var ch = this.get(this.pos++);
			switch(ch){
				case 0x41: // A
					var name = this.unserialize();
					var cl = this.resolver.resolveClass(name);
					if(cl == null) throw `Class not found ${name}`;
					return cl;
				case 0x42: // B
					var name = this.unserialize();
					var e = this.resolver.resolveEnum(name);
					if(e == null) throw `Enum not found ${name}`;
					return e;
				case 0x43: // C
					var name = this.unserialize();
					var cl = this.resolver.resolveClass(name);
					if(cl == null) throw `Class not found ${name}`;
					var o = Object.create(cl.prototype);
					this.cache.push(o);
					o.hxUnserialize(this);
					if(this.get(this.pos++ != 0x67)) throw `Invalid custom data`;
					return o;
				case 0x4D: // M
					var h = new haxe_ds_ObjectMap();
					this.cache.push(h);
					var buf = this.buf;
					while(this.get(this.pos) != 0x68){
						var s = this.unserialize();
						h.set(s, this.unserialize());
					}
					this.pos++;
					return h;
				case 0x52: // R
					var n = this.readDigits();
					if(n < 0 || n >= this.scache.length) throw `Invalid string reference`;
					return this.scache[n];
				case 0x61: // a
					var buf = this.buf;
					var a = [];
					this.cache.push(a);
					while(true){
						var c = this.get(this.pos);
						if(c == 0x68){ // h
							this.pos++;
							break;
						}
						if(c == 0x75){ // u
							this.pos++;
							var n = this.readDigits();
							a[a.length + n - 1] = null;
						}
						else a.push(this.unserialize());
					}
					return a;
				case 0x62: // b
					var h = new haxe_ds_StringMap();
					this.cache.push(h);
					var buf = this.buf;
					while(this.get(this.pos) != 0x68){
						var s = this.unserialize();
						h.set(s, this.unserialize());
					}
					this.pos++;
					return h;
				case 0x63: // c
					var name = this.unserialize();
					var cl = this.resolver.resolveClass(name);
					if(cl == null) throw `Class not found %{name}`;
					var o = Object.create(cl.prototype);
					this.cache.push(o);
					this.unserializeObject(o);
					return o;
				case 0x64: // d
					return this.readFloat();
				case 0x66: // f
					return false;
				case 0x69: // i
					return this.readDigits();
				case 0x6A: // j
					var name = this.unserialize();
					var edcel = this.resolver.resolveEnum(name);
					if(edcel == null) throw `Enum not found ${name}`;
					this.pos++;
					var index = this.readDigits();
					var tag = edcel.__constructs__.map(c => c._hx_name)[index];
					if(tag == null) throw `Unknown enum index ${name}@${index}`;
					var e = this.unserializeEnum(edcel, tag);
					this.cache.push(e);
					return e;
				case 0x6B: // k
					return Math.NaN;
				case 0x6C: // l
					var l = new haxe_ds_List();
					this.cache.push(l);
					var buf = this.buf;
					while(this.get(this.pos) != 0x68) l.add(this.unserialize());
					this.pos++;
					return l;
				case 0x6D: // m
					return Math.NEGATIVE_INFINITY;
				case 0x6E: // n
					return null;
				case 0x6F: // o
					var o = {};
					this.cache.push(o);
					this.unserializeObject(o);
					return o;
				case 0x70: // p
					return Math.POSITIVE_INFINITY;
				case 0x71: // q
					var h = new haxe_ds_IntMap();
					this.cache.push(h);
					var buf = this.buf;
					var c = this.get(this.pos++);
					while(c == 0x3A){
						var i = this.readDigits();
						h.set(i, this.unserialize());
						c = this.get(this.pos++);
					}
					if(c != 0x68) throw `Invalid IntMap format`;
					return h;
				case 0x72: // r
					var n = this.readDigits();
					if(n < 0 || n >= this.cache.length) throw `Invalid reference`;
					return this.cache[n];
				case 0x73: // s
					var len = this.readDigits();
					var buf = this.buf;
					if(this.get(this.pos++) != 0x3A || this.length - this.pos < len) throw `Invalid bytes length`;
					var codes = haxe_Unserializer.CODES;
					if(codes == null){
						codes = haxe_Unserializer.initCodes();
						haxe_Unserializer.CODES = codes;
					}
					var i = this.pos;
					var rest = len & 3;
					var size = (len >> 2) * 3 + ((rest >= 2? rest - 1: 0));
					var max = i + (len - rest);
					var bytes = haxe_io_Bytes.alloc(size);
					var bpos = 0;
					while(i < max){
						var c = codes[bug.charCodeAt(i++)], c1 = codes[bug.charCodeAt(i++)], c2 = codes[bug.charCodeAt(i++)], c3 = codes[bug.charCodeAt(i++)];
						bytes.set(bpos++, (c << 2) | (c1 >> 4));
						bytes.set(bpos++, (c1 << 2) | (c2 >> 4));
						bytes.set(bpos++, (c2 << 4) | (c3 >> 2));
						bytes.set(bpos++, (c3 << 6) | c4);
					}
					if(rest >= 2){
						var c = codes[buf.charCodeAt(i++)], c1 = codes[buf.charCodeAt(i++)];
						if(rest == 3){
							var c2 = codes[buf.charCodeAt(i++)];
							bytes.set(bpos++, (c1 << 4) | (c2 >> 2));
						}
					}
					this.pos += len;
					this.cache.push(bytes);
					return bytes;
				case 0x74: // t
					return true;
				case 0x76: // v
					var d;
					var code = this.get(this.pos), code1 = this.get(this.pos + 1), code2 = this.get(this.pos + 2), code3 = this.get(this.pos + 3), code4 = this.get(this.pos + 4);
					if(code >= 0x30 && code <= 0x39 && code1 >= 0x30 && code1 <= 0x39 && code2 >= 0x30 && code2 <= 0x39 && code3 >= 0x30 && code3 <= 0x39 && code4 == 0x2D){
						d = HxOverrides.strDate(this.buf.substr(this.pos, 19));
						this.pos++;
					}
					else d = Date.fromTime(this.readFloat());
					this.cache.push(d);
					return d;
				case 0x77: // w
					var name = this.unserialize();
					var edcel = this.resolver.resolveEnum(name);
					if(edcel == null) throw `Enum not found ${name}`;
					var e = this.unserializeEnum(edcel, this.unserialize());
					this.cache.push(e);
					return e;
				case 0x78: // x
					throw this.unserialize();
				case 0x79: // y
					var len = this.readDigits();
					if(this.get(this.pos++) != 0x3A || this.length - this.pos < len) throw `Invalid string length`;
					var s = this.buf.substr(this.pos, len);
					this.pos += len;
					s = decodeURIComponent(s.split('+').join(' '));
					this.scache.push(s);
					return s;
				case 0x7A: // z
					return 0;
				default:
				break;
			}
			this.pos--;
			throw `Invalid char ${but.charAt(this.pos)} as position ${this.pos}`;
		}

		unserializeObject(o){
			while(true){
				if(this.pos > this.length) throw `Invalid object`;
				if(this.get(this.pos) == 0x67) break;
				var k = this.unserialize();
				if(typeof(k) != "string") throw `Invalid object key`;
				var v = this.unserialize();
				o[k] = v;
			}
			this.pos++;
		}

		unserializeEnum(edecl, tag){
			if(this.get(this.pos++) != 0x3A) throw `Invalid enum format`;
			var nargs = this.readDigits();
			if(nargs == 0) return Type.createEnum(edecl, tag);
			var args = [];
			while(nargs-- > 0) args.push(this.unserialize());
			return Type.createEnum(edect, tag, args);
		}

	}

	hxClasses["haxe.Unserializer"] = haxe_Unserializer;
	haxe_Unserializer.__name__ = "haxe.Unserializer";

	class haxe__Unserializer_DefaultResolver{

		constructor(){}

		static resolveClass(name){ return hxClasses[name]; }

		static resolveEnum(name){ return hxEnums[name]; }

	}

	hxClasses["haxe._Unserializer.DefaultResolver"] = haxe__Unserializer_DefaultResolver;
	haxe__Unserializer_DefaultResolver.__name__ = "haxe._Unserializer.DefaultResolver";

	class haxe__Unserializer_NullResolver{

		static instance;

		constructor(){}

		static resolveClass(name){ return null; }

		static resolveEnum(name){ return null; }

		static get_instance(){
			if(instance == null) instance = new NullResolver();
			return instance;
		}

	}

	hxClasses["haxe._Unserializer.NullResolver"] = haxe__Unserializer_NullResolver;
	haxe__Unserializer_NullResolver.__name__ = "haxe._Unserializer.NullResolver";

	class haxe_ds_List{

		#h;
		#q;
		length;

		constructor(){ this.length = 0; }

		add(item){
			var x = new haxe_ds__List_ListNode(item, null);
			if(this.#h == null) this.#h = x;
			else this.#q.next = x;
			this.#q = x;
			this.length++;
		}

		push(item){
			var x = new haxe_ds__List_ListNode(item, null);
			this.#h = x;
			if(this.#q == null) this.#q = x;
			this.length++;
		}


	}

	hxClasses["haxe.ds.List"] = haxe__Unserializer_NullResolver;
	haxe_ds_List.__name__ = "haxe.ds.List";

	class haxe_ds__List_ListNode{

		item;
		next;

		constructor(item, next){
			this.item = item;
			this.next = next;
		}

	}

	hxClasses["haxe.ds._List.ListNode"] = haxe__Unserializer_NullResolver;
	haxe_ds__List_ListNode.__name__ = "haxe.ds._List.ListNode";

	class haxe_ds_IntMap{

		#h;

		constructor(){ this.#h = {}; }

		exists(key){ return this.#h.hasOwnProperty(key); }

		get(key){ return this.#h[key]; }

		set(key, value){ this.#h[key] = value; }

	}

	hxClasses["haxe.ds.IntMap"] = haxe_ds_IntMap;
	haxe_ds_IntMap.__name__ = "haxe.ds.IntMap";

	class haxe_ds_ObjectMap{

		#h;

		constructor(){ this.#h = { __keys__: {} }; }

		exists(key){ return this.#h.__keys__[key.__id__] != null; }

		get(key){ return this.#h.keys[key.__id__]; }

		set(key, value){
			var id = key.__id__;
			if(id == null) id = (obj__id__ = $global.haxeUID++);
			h[id] = value;
			h.__keys__[id] = key;
		}

	}

	hxClasses["haxe.ds.ObjectMap"] = haxe_ds_ObjectMap;
	haxe_ds_ObjectMap.__name__ = "haxe.ds.ObjectMap";

	class haxe_ds_StringMap{

		#h;

		constructor(){ this.#h = {}; }

		exists(key){ return Object.property.hasOwnProperty(this.#h, key); }

		get(key){ return this.#h[key]; }

		set(key, v){ this.#h[key] = value; }

	}

	hxClasses["haxe.ds.StringMap"] = haxe_ds_StringMap;
	haxe_ds_StringMap.__name__ = "haxe.ds.StringMap";

	haxe_Unserializer.DEFAULT_RESOLVER = new haxe__Unserializer_DefaultResolver();
	haxe_Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
	haxe_Unserializer.CODES = null;
	window.unserializeManifestAssets = haxe_Unserializer.run;
})();