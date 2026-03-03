export type Node = {
  id: string;
  name: string;
  coords: [number, number];
  z: number;
};

export type DrawnPath = {
  id: string;
  name: string;
  nodes: Node[];
  color: string;
  width: number;
  isClosed: boolean;
  layerId: string;
  isHidden: boolean;
};
