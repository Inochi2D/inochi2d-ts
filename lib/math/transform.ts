/*
    Copyright © 2020, Inochi2D Project
    Distributed under the 2-Clause BSD License, see LICENSE file.
    
    Authors: Luna Nielsen
*/
import { Euler, Matrix, Matrix4, Vector2, Vector3 } from 'three';

export
class Transform {
    private trs: Matrix4 = new Matrix4().identity();
    rot: Vector3 = new Vector3(0, 0, 0);
    scale: Vector2 = new Vector2(1, 1);
    trans: Vector3 = new Vector3(0, 0, 0);

    multiply(other: Transform) {
        let tnew: Transform = new Transform();
        let strs: Matrix4 = other.trs.multiply(this.trs);

        // Cursed calculations to get TRS extracted.
        tnew.trans.setFromMatrixPosition(strs);
        tnew.rot.applyMatrix4(new Matrix4().extractRotation(strs));
        let scale: Vector3 = new Vector3().setFromMatrixScale(strs);
        tnew.scale.x = scale.x;
        tnew.scale.y = scale.y;
        tnew.trs = strs;

        return tnew;
    }

    update() {
        const mat4: Matrix4 = new Matrix4().identity();
        let translate = mat4.makeTranslation(this.trans.x, this.trans.y, this.trans.z);
        let rotation = mat4.makeRotationFromEuler(new Euler(this.rot.x, this.rot.y, this.rot.z, Euler.DefaultOrder));
        let scale = mat4.makeScale(this.scale.x, this.scale.y, 1);

        this.trs = scale.multiply(rotation).multiply(translate);
    }

    matrix(): Matrix4 {
        return this.trs;
    }
}