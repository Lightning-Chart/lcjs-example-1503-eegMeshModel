# EEG data visualization with 3D Mesh Model.

![EEG data visualization with 3D Mesh Model.](eegMeshModel-darkGold.png)

This demo application belongs to the set of examples for LightningChart JS, data visualization library for JavaScript.

LightningChart JS is entirely GPU accelerated and performance optimized charting library for presenting massive amounts of data. It offers an easy way of creating sophisticated and interactive charts and adding them to your website or web application.

The demo can be used as an example or a seed project. Local execution requires the following steps:

-   Make sure that relevant version of [Node.js](https://nodejs.org/en/download/) is installed
-   Open the project folder in a terminal:

          npm install              # fetches dependencies
          npm start                # builds an application and starts the development server

-   The application is available at _http://localhost:8080_ in your browser, webpack-dev-server provides hot reload functionality.


## Description

This example demonstrates real-time visualization of brain activity and EEG data.

It involves 10 sensors, each recording 1,000 points per second. The brain is colored by interpolating between sensor values.
Each sensor receives data from raw measurements, smoothed using a 100 ms running average.

For more information on dynamic mesh coloring, you can refer to our [dynamic mesh model example](https://lightningchart.com/lightningchart-js-interactive-examples/examples/lcjs-example-1503-dynamicMeshModel.html)

To further explore this use case, you can calculate the power spectral density for each raw sensor feed.
However, this process can be resource-intensive and is typically not suitable for frontend execution. For a similar example from our .NET product line, visit [https://lightningchart.com/blog/eeg-chart/].


## API Links

* [Mesh Model]
* [Vertex Values]
* [Line series]
* [Dashboard]


## Support

If you notice an error in the example code, please open an issue on [GitHub][0] repository of the entire example.

Official [API documentation][1] can be found on [LightningChart][2] website.

If the docs and other materials do not solve your problem as well as implementation help is needed, ask on [StackOverflow][3] (tagged lightningchart).

If you think you found a bug in the LightningChart JavaScript library, please contact sales@lightningchart.com.

Direct developer email support can be purchased through a [Support Plan][4] or by contacting sales@lightningchart.com.

[0]: https://github.com/Arction/
[1]: https://lightningchart.com/lightningchart-js-api-documentation/
[2]: https://lightningchart.com
[3]: https://stackoverflow.com/questions/tagged/lightningchart
[4]: https://lightningchart.com/support-services/

© LightningChart Ltd 2009-2022. All rights reserved.


[Mesh Model]: https://lightningchart.com/js-charts/api-documentation/v7.0.1/classes/MeshModel3D.html
[Vertex Values]: https://lightningchart.com/js-charts/api-documentation/v7.0.1/classes/MeshModel3D.html#setVertexValues
[Line series]: https://lightningchart.com/js-charts/api-documentation/v7.0.1/classes/LineSeries.html
[Dashboard]: https://lightningchart.com/js-charts/api-documentation/v7.0.1/classes/Dashboard.html

