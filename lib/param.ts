import { Matrix4, Vector2 } from 'three';

enum InterpolateMode {
  Linear = 'linear',
  Smoothstep = 'smoothstep',
  Smootherstep = 'smootherstep',
}

export class Binding {
  node: number = 0;
  is_set: boolean[][] = [];
  interpolate_mode: InterpolateMode = InterpolateMode.Linear;
  values: BindingValues = new BindingValues();
}

export class BindingValues {
  ZSort: number[][] = [];
  TransformTX: number[][] = [];
  TransformTY: number[][] = [];
  TransformSX: number[][] = [];
  TransformSY: number[][] = [];
  TransformRX: number[][] = [];
  TransformRY: number[][] = [];
  TransformRZ: number[][] = [];
  Deform: Vector2[][] = [];
}

export class AxisPoints {
  x: number[] = [];
  y: number[] = [];
}

export class PartOffsets {
  vert_offset: number = 0;
  vert_len: number = 0;
  trans_offset: Matrix4 = new Matrix4();
}

/**
 * Represents a parameter that can animate nodes and affect meshes.
 */
export class Param {
  /**
   * The unique identifier of the parameter.
   */
  uuid: number = -1;
  /**
   * The name of the parameter.
   */
  name: string = "";
  /**
   * Indicates whether the parameter is a 2D vector or not.
   */
  is_vec2: boolean = false
  /**
   * The minimum value allowed for the parameter.
   */
  min: Vector2 = new Vector2();
  /**
   * The maximum value allowed for the parameter.
   */
  max: Vector2 = new Vector2();
  /**
   * The default values for the parameter.
   */
  defaults: Vector2 = new Vector2();
  /**
   * The axis points used for interpolation.
   */
  axis_points: AxisPoints = new AxisPoints();
  /**
   * The bindings associated with the parameter.
   */
  bindings: Binding[] = []

  /**
   * Applies the parameter's value to the associated nodes and meshes.
   * @param val - The value of the parameter.
   * @param node_offsets - The offsets of the nodes.
   * @param deform_buf - The deform buffer for mesh deformation.
   */
  apply(
    val: Vector2,
    node_offsets: Map<number, PartOffsets>,
    deform_buf: Vector2[]
  ): void {
    throw new Error("Not implemented.");
  }
  

  private getAxisPointIndexes(value: number, axisPoints: number[]): [number, number] {
    const index = axisPoints.findIndex((point) => point >= value);
    if (index === -1) return [axisPoints.length - 2, axisPoints.length - 1];
    if (index === 0) return [index, index + 1];
    return [index - 1, index];
  }

  private applyTransformOffset(
    binding: Binding,
    transform: Matrix4,
    property: 'translation' | 'scale' | 'rotation',
    axis: 'x' | 'y' | 'z',
    rangeIn: Vector2,
    valNormed: Vector2
  ): void {
    throw new Error("Not implemented.");
    
  }
  
  private applyDeformOffset(
    binding: Binding,
    deform: Vector2[][],
    rangeIn: Vector2,
    valNormed: Vector2
  ): void {
    throw new Error("Not implemented.");
  }
  
}