import { createArrayMapperClass } from './createArrayMapperClass';

describe('createArrayMapperClass', () => {
  it('should create a class with the given name', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', []);
    expect(DynamicClass.name).toBe('DynamicClass');
  });

  it('should create a class with the given getters', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const instance = new DynamicClass([1, 2]);
    expect(instance.a).toBe(1);
    expect(instance.b).toBe(2);
  });

  it('should create a class with the given setters', () => {
    const DynamicClass = createArrayMapperClass('DynamicClass', ['a', 'b']);
    const array = [1, 2];
    const instance = new DynamicClass(array);
    instance.a = 3;
    instance.b = 4;
    expect(array).toEqual([3, 4]);
  });
});
