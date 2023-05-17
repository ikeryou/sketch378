import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Update } from '../libs/update';
import vt from '../glsl/mesh.vert';
import fg from '../glsl/mesh.frag';
import { Object3D, ShaderMaterial, Color, Mesh, Vector2, SphereGeometry } from 'three';
import { MousePointer } from '../core/mousePointer';
import { Util } from '../libs/util';

export class Visual extends Canvas {

  private _con:Object3D;
  private _mesh: Array<Mesh> = [];

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    const seg = 3;
    const geo = new SphereGeometry(0.5, seg, seg)

    const num = 100;
    for(let i = 0; i < num; i ++) {
      const col = Util.map(i, 1, 0, 0, num);

      const m = new Mesh(
        geo,
        new ShaderMaterial({
          vertexShader:vt,
          fragmentShader:fg,
          transparent: false,
          depthTest: false,
          wireframe: i != 0,
          uniforms:{
            color:{value: i == 0 ? new Color(0xff0000) : new Color(col, col, col)},
            mouse:{value: new Vector2(0,0)},
            alpha:{value: col},
          }
        })
      );
      this._con.add(m);
      this._mesh.push(m);
    }
    this._mesh.reverse();



    this._resize();
  }


  protected _update(): void {
    super._update();

    const sw = this.renderSize.width;
    const sh = this.renderSize.height;

    const mx = MousePointer.instance.easeNormal.x;
    const my = MousePointer.instance.easeNormal.y;

    this._mesh.forEach((m, i) => {
      const s = Util.map(i, 1.5, 0.01, 0, this._mesh.length);
      m.scale.set(sw * s, sh * s, 1);

      const uni = this._getUni(m);
      uni.mouse.value.x = Util.map(mx, 0, 1, -1, 1);
      uni.mouse.value.y = Util.map(my, 1, 0, -1, 1);

      const kake = Util.map(i, sw * 2, 0, 0, this._mesh.length);
      const radian = this._c * 1 + i * 2
      m.position.x = Math.sin(Util.radian(radian * 0.45)) * Math.sin(Util.radian(radian * -0.85)) * kake;
      m.position.y = Math.cos(Util.radian(radian)) * kake;
      m.position.z =  -sw * 0.75

      m.rotation.z = Util.radian(this._c * 1 + i * 1);
    });

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.render(this.mainScene, this.cameraPers);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);

    this.cameraPers.fov = 90;
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();
  }
}
