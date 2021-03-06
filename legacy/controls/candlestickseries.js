var _ = require("lodash"),
    PriceLabels = require("../labels/pricelabels");

function CandleStickSeries(options) {
    /* {
            width: plot width
            height: plot height
            data: price data (raw)
       }
    */
    var self = this;
    this.options = options;

    this.margin = _.defaults(options.margin, {left: 0, right: 0, top: 0, bottom: 0});
    this.canvasWidth = options.width - this.margin.left - this.margin.right;
    this.canvasHeight = options.height - this.margin.top - this.margin.bottom;

    // Stretch the min and max by certain amounts to give enough space at the top and bottom of the price plot
    var labels = PriceLabels.generate(options.data.series.min, options.data.series.max, this.canvasHeight);
    console.log(labels, options.data.series.min, options.data.series.max, this.canvasHeight);
    this.extendedMin = labels[0];
    this.extendedMax = labels[labels.length - 1];

    this.xUnitScale = this.canvasWidth / options.data.series.length;
    this.yUnitScale = this.canvasHeight / (this.extendedMax - this.extendedMin);
    console.log("CandleStickSeries: y-scale", this.yUnitScale, this.extendedMin);
    this.candleWidth = (this.xUnitScale * 70/100.0); //candle takes 70% of the total space allowed (for now)
    this.candleLeftMargin = (this.xUnitScale * 15/100.0); //center the candle in the available space (100-70/2)

    // console.log(options.data.series.max, options.data.series.min, options.height, this.yUnitScale);
    this.candles = _.chain(options.data.series)
                    .map(function(data, index) {

                        if (data.open > data.close) {
                            data.above = data.open;
                            data.below = data.close;
                        } else {
                            data.below = data.open;
                            data.above = data.close;
                        }

                        var path = [];

                        path.push("M" + self.toPlotX(index) + "," + self.toPlotY(data.above));
                        path.push("L" + (self.toPlotX(index) + self.candleWidth) + "," + self.toPlotY(data.above)); //top edge
                        path.push("L" + (self.toPlotX(index) + self.candleWidth) + "," + self.toPlotY(data.below)); //right edge
                        path.push("L" + self.toPlotX(index) + "," + self.toPlotY(data.below)); //bottom edge
                        path.push("L" + self.toPlotX(index) + "," + self.toPlotY(data.above)); //left edge
                        path.push("M" + (self.toPlotX(index) + self.candleWidth/2) + "," + self.toPlotY(data.high)); //top whisker
                        path.push("L" + (self.toPlotX(index) + self.candleWidth/2) + "," + self.toPlotY(data.above));
                        path.push("M" + (self.toPlotX(index) + self.candleWidth/2) + "," + self.toPlotY(data.below)); //bottom whisker
                        path.push("L" + (self.toPlotX(index) + self.candleWidth/2) + "," + self.toPlotY(data.low));

                        return {
                            pathStr : path.join(""),
                            fill : data.open > data.close ? "#D14836" : "#46B771", //"#2F7ED8"
                            stroke: "black"
                        }
                    })
                    .value();
}


CandleStickSeries.prototype.toPlotX = function (dataX) {
    return formatNumber(this.margin.left + (this.xUnitScale * dataX) + this.candleLeftMargin);
}

CandleStickSeries.prototype.toPlotY = function (dataY) {
    return formatNumber(this.margin.top + this.canvasHeight - ((dataY - this.extendedMin) * this.yUnitScale));
}

function formatNumber(number) {
    return +number.toFixed(3);
}

module.exports = CandleStickSeries;

