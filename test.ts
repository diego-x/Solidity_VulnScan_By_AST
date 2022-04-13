interface CarInterface {
  model: string;
  radio?;
  getYear(): any;
}

class Car implements CarInterface {
  constructor(
    readonly model,
    private engine,
    public radio?,
  ) {} // 简写法

  static Manufacturer: string = 'BMW';
  getYear() {}
}