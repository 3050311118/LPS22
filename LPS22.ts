/**
* ST LPS22HB/HD/HH pressure Sensor I2C extension for makecode.
* From microbit/micropython Chinese community.
* https://github.com/makecode-extensions
*/

/**
 * ST LPS22HB/HD/HH pressure Sensor I2C extension
 */
//% weight=100 color=#60a0e0 icon="\uf2c8" block="LPS22" 
namespace LPS22 {
    export enum LPS22_I2C_ADDRESS {
        //% block="92"
        ADDR_92 = 92,
        //% block="93"
        ADDR_93 = 93
    }

    export enum LPS22_P_UNIT {
        //% block="Pa"
        Pa = 0,
        //% block="hPa"
        hPa = 1
    }

    export enum LPS22_T_UNIT {
        //% block="C"
        C = 0,
        //% block="F"
        F = 1
    }

    const LPS22_CTRL_REG1 = (0x10)
    const LPS22_CTRL_REG2 = (0x11)
    const LPS22_STATUS = (0x27)
    const LPS22_TEMP_OUT_L = (0x2B)
    const LPS22_PRESS_OUT_XL = (0x28)
    const LPS22_PRESS_OUT_L = (0x29)

    let LPS22_I2C_ADDR = LPS22.LPS22_I2C_ADDRESS.ADDR_93  // defaut address
    let _oneshot = false

    init()  // init sensor at startup

    // set dat to reg
    function setreg(reg: number, dat: number): void {
        let tb = pins.createBuffer(2)
        tb[0] = reg
        tb[1] = dat
        pins.i2cWriteBuffer(LPS22_I2C_ADDR, tb)
    }

    // read a Int8LE from reg
    function getInt8LE(reg: number): number {
        pins.i2cWriteNumber(LPS22_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(LPS22_I2C_ADDR, NumberFormat.Int8LE);
    }

    // read a UInt8LE from reg
    function getUInt8LE(reg: number): number {
        pins.i2cWriteNumber(LPS22_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(LPS22_I2C_ADDR, NumberFormat.UInt8LE);
    }

    // read a Int16LE from reg
    function getInt16LE(reg: number): number {
        pins.i2cWriteNumber(LPS22_I2C_ADDR, reg | 0x80, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(LPS22_I2C_ADDR, NumberFormat.Int16LE);
    }

    // read a UInt16LE from reg
    function getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(LPS22_I2C_ADDR, reg | 0x80, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(LPS22_I2C_ADDR, NumberFormat.UInt16LE);
    }

    // set a mask dat to reg
    function setreg_mask(reg: number, dat: number, mask: number): void {
        setreg(reg, (getUInt8LE(reg) & mask) | dat)
    }

    // limit decimal digits
    function bitround(x: number, b: number = 1): number {
        let n = 10 ** b
        return Math.round(x * n) / n
    }

    /**
     * Init sensor
     */
    //% block="Initialize, address %addr"
    //% addr.defl=LPS22.LPS22_I2C_ADDRESS.ADDR_93
    export function init(addr: LPS22.LPS22_I2C_ADDRESS = LPS22.LPS22_I2C_ADDRESS.ADDR_93) {
        LPS22_I2C_ADDR = (addr == LPS22.LPS22_I2C_ADDRESS.ADDR_93) ? LPS22.LPS22_I2C_ADDRESS.ADDR_93 : LPS22.LPS22_I2C_ADDRESS.ADDR_92

        // ODR = 1 EN_LPFP= 1 BDU= 1
        setreg(LPS22_CTRL_REG1, 0x1A)
        oneshot_mode(false)
    }

    // oneshot mode handle
    function ONE_SHOT(b: number): void {
        if (_oneshot) {
            setreg(LPS22_CTRL_REG2, getUInt8LE(LPS22_CTRL_REG2) | 0x01)
            getUInt8LE(0x28 + b * 2)
            while (true) {
                if (getUInt8LE(LPS22_STATUS) & b)
                    return
            }
        }
    }

    /**
     * set oneshot mode to reduce power consumption
     */
    //% block="oneshot mode %oneshot"
    export function oneshot_mode(oneshot: boolean = false) {
        _oneshot = oneshot
        let t = (oneshot) ? 0 : 0x10
        setreg_mask(LPS22_CTRL_REG1, t, 0x0F)
    }

    /**
     * get temperature
     */
    //% block="temperature %u"
    export function temperature(u: LPS22.LPS22_T_UNIT = LPS22.LPS22_T_UNIT.C): number {
        ONE_SHOT(2)
        let T = getInt16LE(LPS22_TEMP_OUT_L) / 100
        if (u == LPS22.LPS22_T_UNIT.F) T = 32 + T * 9 / 5
        return bitround(T, 1)
    }

    /**
     * get pressure from sensor
     */
    //% block="pressure %u"
    //% u.defl=LPS22.LPS22_P_UNIT.hPa
    export function pressure(u: LPS22.LPS22_P_UNIT = LPS22.LPS22_P_UNIT.hPa): number {
        ONE_SHOT(1)
        let P = (getUInt16LE(LPS22_PRESS_OUT_L) * 256 + getUInt8LE(LPS22_PRESS_OUT_XL)) / 4096
        if (u == LPS22.LPS22_P_UNIT.Pa) P = P * 100
        return Math.round(P)
    }

    // power function approximate calculation for (1+x)^n, x~0
    function apow(x: number, n: number): number {
        let d = x - 1
        return 1 + (n * d) + (n * (n - 1) * d * d) / 2
    }

    /**
     * calaulate altitude use pressure and temperature
     */
    //% block="altitude"
    export function altitude(): number {
        return (apow(1013.25 / pressure(), 1 / 5.257) - 1.0) * (temperature() + 273.15) / 0.0065
    }
}
