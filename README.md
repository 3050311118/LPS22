# LPS22HB/HD/HH package

ST LPS22 Pressure Sensor I2C extension for makecode.  

Author: shaoziyang  
Date:   2019.Jul  

## Basic usage
```
basic.forever(function () {
    serial.writeValue("T", LPS22.temperature(LPS22.LPS22_T_UNIT.C))
    serial.writeValue("P", LPS22.pressure(LPS22.LPS22_P_UNIT.hPa))
    serial.writeValue("A", LPS22.altitude())
    basic.pause(1000)
})
```

**Note**
Because MakeCode power function error ([see issue #2192](https://github.com/microsoft/pxt-microbit/issues/2192))! So altitude() use approximate calculation method instaed.

## License

MIT

Copyright (c) 2018, microbit/micropython Chinese community  

## Supported targets

* for PXT/microbit


[From microbit/micropython Chinese community](http://www.micropython.org.cn)
