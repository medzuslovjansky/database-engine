export interface AsyncView<ID, Entity> extends AsyncIterable<Entity> {
  get(id: ID): Promise<Entity | undefined>;
  has(id: ID): Promise<boolean>;
  size(): Promise<number>;
  keys(): Promise<ID[]>;
  values(): Promise<Entity[]>;
  forEach(visitor: (entity: Entity) => void | Promise<void>): Promise<void>;
  find(predicate: (entity: Entity) => boolean): Promise<Entity | undefined>;
}

export interface SyncView<ID, Entity> extends Iterable<Entity> {
  get(id: ID): Entity | undefined;
  has(id: ID): boolean;
  size(): number;
  keys(): ID[];
  values(): Entity[];
  forEach(visitor: (entity: Entity) => void): void;
  find(predicate: (entity: Entity) => boolean): Entity;
}
