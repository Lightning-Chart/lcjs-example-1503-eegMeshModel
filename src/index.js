const lcjs = require('@arction/lcjs')
const objLoader = require('webgl-obj-loader')

const {
    lightningChart,
    SolidFill,
    ColorRGBA,
    AxisTickStrategies,
    AxisScrollStrategies,
    PointStyle3D,
    PalettedFill,
    LUT,
    emptyLine,
    AutoCursorModes,
    emptyFill,
    synchronizeAxisIntervals,
    LegendBoxBuilders,
    Themes,
} = lcjs

const sensors = [
    { x: 0 * 2, y: 0.52 * 2, z: 0.21 * 2, value: 120, name: 'AF3', history: [] },
    { x: 0 * 2, y: 0.55 * 2, z: 0 * 2, value: 120, name: 'AF4', history: [] },
    { x: 0.05 * 2, y: 0.4 * 2, z: -0.28 * 2, value: 120, name: 'F5', history: [] },
    { x: 0.45, y: 0.7, z: -0.2, value: 120, name: 'F6', history: [] },
    { x: 0.5, y: 0.7, z: 0.3, value: 120, name: 'FC5', history: [] },
    { x: 0.16 * 2, y: 0.4 * 2, z: 0.3 * 2, value: 120, name: 'FC6', history: [] },
    { x: -0.05 * 2, y: 0.4 * 2, z: -0.28 * 2, value: 120, name: 'T7', history: [] },
    { x: -0.45, y: 0.7, z: -0.2, value: 120, name: 'CP5', history: [] },
    { x: -0.5, y: 0.7, z: 0.3, value: 120, name: 'CP6', history: [] },
    { x: -0.16 * 2, y: 0.4 * 2, z: 0.3 * 2, value: 120, name: 'O2', history: [] },
]

const dashboard = lightningChart()
    .Dashboard({
        numberOfColumns: 2,
        numberOfRows: sensors.length,
        // theme: Themes.darkGold,
    })
    .setSplitterStyle(emptyLine)

const palette = new PalettedFill({
    lookUpProperty: 'value',
    lut: new LUT({
        interpolate: true,
        steps: [
            { value: -500, color: ColorRGBA(255, 0, 255), label: '' },
            { value: 0, color: ColorRGBA(0, 0, 255), label: '' },
            { value: 500, color: ColorRGBA(0, 150, 255), label: '' },
            { value: 1000, color: ColorRGBA(0, 100, 100), label: '' },
            { value: 1500, color: ColorRGBA(0, 255, 150), label: '' },
            { value: 2000, color: ColorRGBA(0, 255, 0), label: '' },
            { value: 4000, color: ColorRGBA(155, 150, 0), label: '' },
            { value: 9000, color: ColorRGBA(255, 0, 0), label: '' },
        ],
    }),
})

const chart3D = dashboard
    .createChart3D({
        columnIndex: 1,
        rowIndex: 0,
        columnSpan: 1,
        rowSpan: sensors.length,
    })
    .setTitle('')
    .setSeriesBackgroundFillStyle(emptyFill)
    .setSeriesBackgroundStrokeStyle(emptyLine)

const channels = sensors.map((info, i) => {
    const chart = dashboard
        .createChartXY({
            columnIndex: 0,
            rowIndex: i,
            columnSpan: 1,
            rowSpan: 1,
        })
        .setAutoCursorMode(AutoCursorModes.disabled)
        .setPadding(0)
        .setMouseInteractions(false)
        .setSeriesBackgroundStrokeStyle(emptyLine)
        .setTitle(`${info.name}`)
        .setTitlePosition('series-left-top')
        .setPadding({ left: 40 })
    const axisX = chart
        .getDefaultAxisX()
        .setScrollStrategy(AxisScrollStrategies.progressive)
        .setInterval({ start: 0, end: 15000, stopAxisAfter: false })
        .setTickStrategy(AxisTickStrategies.Time, (ticks) =>
            ticks
                .setMajorTickStyle((major) => major.setGridStrokeStyle(emptyLine))
                .setMinorTickStyle((minor) => minor.setGridStrokeStyle(emptyLine)),
        )
        .setStrokeStyle(emptyLine)

    const axisY = chart
        .getDefaultAxisY()
        .setStrokeStyle(emptyLine)
        .setInterval({ start: -5000, end: 9500, stopAxisAfter: false })
        .setScrollStrategy(AxisScrollStrategies.expansion)
        .setTickStrategy(AxisTickStrategies.Empty)

    if (i !== sensors.length - 1) {
        axisX.setTickStrategy(AxisTickStrategies.Empty).setScrollStrategy(undefined)
    }

    // Series for displaying new data.
    const series = chart
        .addLineSeries({
            automaticColorIndex: i,
            dataPattern: { pattern: 'ProgressiveX' },
        })
        .setName(info.name)
        .setDataCleaning({ minDataPointCount: 1 })

    return {
        chart,
        axisX,
        axisY,
        series,
    }
})
synchronizeAxisIntervals(...channels.map((chart) => chart.axisX))

chart3D
    .getDefaultAxes()
    .forEach((axis) =>
        axis
            .setMouseInteractions(false)
            .setInterval({ start: -1, end: 1 })
            .setTickStrategy(AxisTickStrategies.Empty)
            .setStrokeStyle(emptyLine),
    )
chart3D.setCameraAutomaticFittingEnabled(false).setCameraLocation({ x: 0.5, y: 0.4, z: 1 })

const sensorSeries = chart3D
    .addPointSeries({ individualLookupValuesEnabled: true })
    .add(sensors)
    .setPointStyle(
        new PointStyle3D.Triangulated({
            fillStyle: palette,
            size: 10,
            shape: 'sphere',
        }),
    )
const brainSeries = chart3D
    .addMeshModel()
    .setScale(0.26)
    .setModelLocation({ x: 0, y: 0, z: 0 })
    .setModelAlignment({
        x: 0,
        y: -1,
        z: 0.2,
    })
    .setName('Brain')
const headSeries = chart3D
    .addMeshModel()
    .setName('Head')
    .setScale(2)
    .setFillStyle(new SolidFill({ color: ColorRGBA(255, 255, 255, 90) }))
    .setBackfaceCullingMode('cull-back')

const loadBinaryFile = async (url) => {
    const result = await fetch(document.head.baseURI + url)
    const blob = await result.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const originalArray = new Int16Array(arrayBuffer)
    const chunkSize = 50000
    const arrayOfArrays = []
    for (let i = 0; i < originalArray.length; i += chunkSize) {
        const chunk = originalArray.slice(i, i + chunkSize)
        arrayOfArrays.push(chunk)
    }
    return arrayOfArrays
}

Promise.all([
    fetchFile('examples/assets/1503/brain.obj'),
    fetchFile('examples/assets/1503/head.obj'),
    loadBinaryFile('examples/assets/1503/CutData3.bin'),
]).then((results) => {
    const brain = new objLoader.Mesh(results[0])
    const head = new objLoader.Mesh(results[1])
    const EEGdata = results[2]

    brainSeries.setModelGeometry({ vertices: brain.vertices, indices: brain.indices, normals: brain.vertexNormals }).setFillStyle(palette)
    headSeries.setModelGeometry({ vertices: head.vertices, indices: head.indices, normals: head.vertexNormals }).setMouseInteractions(false)

    const vertexCoordSensorWeights = []
    brainSeries.setVertexValues((coordsWorld) => {
        const vertexValues = []
        for (let i = 0; i < coordsWorld.length; i += 1) {
            const locAxis = chart3D.translateCoordinate(coordsWorld[i], chart3D.coordsWorld, chart3D.coordsAxis)

            const sensorWeights = new Array(sensors.length).fill(0)
            let sumOfWeights = 0
            sensors.forEach((sensor, i2) => {
                const locationDeltaX = sensor.x - locAxis.x
                const locationDeltaY = sensor.y - locAxis.y
                const locationDeltaZ = sensor.z - locAxis.z
                const dist = Math.sqrt(locationDeltaX ** 2 + locationDeltaY ** 2 + locationDeltaZ ** 2)
                const weight = dist !== 0 ? 1 / dist ** 3 : 1
                sensorWeights[i2] = weight
                sumOfWeights += weight
            })
            vertexCoordSensorWeights.push({ sumOfWeights, sensorWeights })
            const vertexValue = sensors.reduce((prev, cur, i2) => prev + cur.value * sensorWeights[i2], 0) / sumOfWeights
            vertexValues.push(vertexValue)
        }
        return vertexValues
    })

    // Stream data into series.
    let tStart = window.performance.now()
    let pushedDataCount = 0

    const dataPointsPerSecond = 1000 // 1000 Hz
    const xStep = 1000 / dataPointsPerSecond
    const streamData = (timestamp) => {
        const tNow = window.performance.now()
        const shouldBeDataPointsCount = Math.floor((dataPointsPerSecond * (tNow - tStart)) / 1000)
        const newDataPointsCount = Math.min(shouldBeDataPointsCount - pushedDataCount, 1000)
        if (newDataPointsCount > 0) {
            const seriesNewDataPoints = []
            for (let i = 0; i < sensors.length; i++) {
                const dataSet = EEGdata[i]
                const newDataPoints = []
                for (let iDp = 0; iDp < newDataPointsCount; iDp++) {
                    const x = (pushedDataCount + iDp) * xStep
                    const iData = (pushedDataCount + iDp) % dataSet.length
                    const y = dataSet[iData]
                    const point = { x, y }
                    newDataPoints.push(point)
                }
                seriesNewDataPoints[i] = newDataPoints

                // Calculate average sensor value from last 100 samples ~ 100 ms this is used to smoothen the brain coloring
                sensors[i].history.push(...newDataPoints.map((p) => p.y))
                while (sensors[i].history.length > 100) {
                    sensors[i].history.shift()
                }
                const avg = sensors[i].history.reduce((prev, cur) => prev + cur, 0) / sensors[i].history.length
                sensors[i].value = avg
            }

            channels.forEach((channel, iChannel) => channel.series.add(seriesNewDataPoints[iChannel]))
            pushedDataCount += newDataPointsCount

            sensorSeries.clear().add(sensors)
            const vertexValues = []
            brainSeries.setVertexValues((vertex) => {
                for (let i = 0; i < vertex.length; i += 1) {
                    const { sumOfWeights, sensorWeights } = vertexCoordSensorWeights[i]
                    const vertexValue = sensors.reduce((prev, cur, i2) => prev + cur.value * sensorWeights[i2], 0) / sumOfWeights || 20
                    vertexValues.push(vertexValue)
                }
                return vertexValues
            })
        }
        requestAnimationFrame(streamData)
    }
    streamData()

    const legend = chart3D.addLegendBox(LegendBoxBuilders.HorizontalLegendBox).add(brainSeries)
})

function fetchFile(url) {
    return fetch(document.head.baseURI + url).then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`)
        }
        return response.text()
    })
}
