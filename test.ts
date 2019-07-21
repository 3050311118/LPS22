basic.forever(function () {
    basic.pause(1000)
    serial.writeValue("T", LPS22.temperature(LPS22.LPS22_T_UNIT.C))
    serial.writeValue("P", LPS22.pressure(LPS22.LPS22_P_UNIT.hPa))
    serial.writeValue("A", LPS22.altitude())
})