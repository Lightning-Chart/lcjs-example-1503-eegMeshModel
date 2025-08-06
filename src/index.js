const lcjs = require('@lightningchart/lcjs')

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
    LegendPosition,
    Themes,
    DataSetXY,
} = lcjs

const exampleContainer = document.getElementById('chart') || document.body
if (exampleContainer === document.body) {
    exampleContainer.style.width = '100vw'
    exampleContainer.style.height = '100vh'
    exampleContainer.style.margin = '0px'
}
exampleContainer.style.display = 'flex'
exampleContainer.style.flexDirection = 'row'
const containerTrends = document.createElement('div')
containerTrends.style.width = '50%'
containerTrends.style.height = '100%'
exampleContainer.append(containerTrends)
const containerModel = document.createElement('div')
containerModel.style.width = '50%'
containerModel.style.height = '100%'
exampleContainer.append(containerModel)

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

const lc = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })

const lut = new LUT({
    interpolate: true,
    steps: [
        { value: -500, color: ColorRGBA(255, 0, 255), label: 'Min' },
        { value: 0, color: ColorRGBA(0, 0, 255), label: '' },
        { value: 500, color: ColorRGBA(0, 150, 255), label: '' },
        { value: 1000, color: ColorRGBA(0, 100, 100), label: '' },
        { value: 1500, color: ColorRGBA(0, 255, 150), label: '' },
        { value: 2000, color: ColorRGBA(0, 255, 0), label: '' },
        { value: 4000, color: ColorRGBA(155, 150, 0), label: '' },
        { value: 9000, color: ColorRGBA(255, 0, 0), label: 'Max' },
    ],
})

const palette = new PalettedFill({
    lookUpProperty: 'value',
    lut,
})

const chart3D = lc
    .Chart3D({
        container: containerModel, 
        legend: {
            position: LegendPosition.BottomCenter,
            addEntriesAutomatically: false 
        },
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('')
    .setSeriesBackgroundFillStyle(emptyFill)
    .setSeriesBackgroundStrokeStyle(emptyLine)
    .setCursorMode(undefined)
    .setUserInteractions({
        restoreDefault: false,
    })

chart3D.legend.add(lut, { text: 'Brain', lutLength: 250 })

const chart = lc
    .ChartXY({
        legend: { visible: false },
        container: containerTrends,
        // theme: Themes.darkGold
    })
    .setTitle('')

const axisX = chart
    .getDefaultAxisX()
    .setScrollStrategy(AxisScrollStrategies.scrolling)
    .setDefaultInterval((state) => ({
        end: state.dataMax ?? 0,
        start: (state.dataMax ?? 0) - 15_000,
        stopAxisAfter: false,
    }))
    .setTickStrategy(AxisTickStrategies.Time)
    .setIntervalRestrictions((state) => ({
        endMin: state.dataMax,
        endMax: state.dataMax,
    }))

const dataSet = new DataSetXY({
    schema: {
        x: { pattern: 'progressive' },
        ...Object.fromEntries(sensors.map((_, i) => [`ch${i}`, { pattern: null }])),
    },
}).setMaxSampleCount(100_000)
chart.getDefaultAxisY().dispose()
const channels = sensors.map((info, i) => {
    const iStack = sensors.length - (i + 1)
    const axisY = chart
        .addAxisY({ iStack })
        .setTitle(info.name)
        .setTitleRotation(0)
        .setStrokeStyle(emptyLine)
        .setDefaultInterval({ start: -5000, end: 9500, stopAxisAfter: false })
        .setScrollStrategy(AxisScrollStrategies.expansion)
        .setTickStrategy(AxisTickStrategies.Empty)

    // Series for displaying new data.
    const series = chart
        .addLineSeries({
            automaticColorIndex: i,
            yAxis: axisY,
        })
        .setName(info.name)
        .setDataSet(dataSet, { x: 'x', y: `ch${i}` })

    return {
        axisY,
        series,
    }
})

chart3D
    .getDefaultAxes()
    .forEach((axis) =>
        axis.setPointerEvents(false).setInterval({ start: -1, end: 1 }).setTickStrategy(AxisTickStrategies.Empty).setStrokeStyle(emptyLine),
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
    const result = await fetch(new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + url)
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
    const EEGdata = results[2]

    brainSeries.setModelFromObj(results[0]).setFillStyle(palette)
    headSeries.setModelFromObj(results[1]).setPointerEvents(false)

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
    const streamData = () => {
        const tNow = window.performance.now()
        const shouldBeDataPointsCount = Math.floor((dataPointsPerSecond * (tNow - tStart)) / 1000)
        const newDataPointsCount = Math.min(shouldBeDataPointsCount - pushedDataCount, 1000)
        if (newDataPointsCount > 0) {
            const newData = { x: [], ...Object.fromEntries(sensors.map((_, i) => [`ch${i}`, []])) }
            for (let iDp = 0; iDp < newDataPointsCount; iDp++) {
                const x = (pushedDataCount + iDp) * xStep
                newData.x.push(x)
                for (let i = 0; i < sensors.length; i++) {
                    const dataSet = EEGdata[i]
                    const iData = (pushedDataCount + iDp) % dataSet.length
                    const y = dataSet[iData]
                    newData[`ch${i}`].push(y)
                    sensors[i].history.push(y)
                }
            }
            // Calculate average sensor value from last 100 samples ~ 100 ms this is used to smoothen the brain coloring
            sensors.forEach((sensor) => {
                while (sensor.history.length > 100) {
                    sensor.history.shift()
                }
                const avg = sensor.history.reduce((prev, cur) => prev + cur, 0) / sensor.history.length
                sensor.value = avg
            })

            dataSet.appendSamples(newData)
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
})

function fetchFile(url) {
    return fetch(new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + url).then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`)
        }
        return response.text()
    })
}
