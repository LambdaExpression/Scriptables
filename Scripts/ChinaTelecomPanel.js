// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: mobile-alt;
//
// iOS 桌面组件脚本 @「小件件」
// 开发说明：请从 Widget 类开始编写，注释请勿修改
// https://x.im3x.cn
//

// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule
const {Base} = require("./「小件件」开发环境")

// @组件代码开始
class Widget extends Base {
    /**
     * 传递给组件的参数，可以是桌面 Parameter 数据，也可以是外部如 URLScheme 等传递的数据
     * @param {string} arg 自定义参数
     */
    constructor(arg) {
        super(arg)
        this.name = '中国电信面板'
        this.desc = '一个展示电信话费、流量的小插件'
        this.config = {
            canvSize: 100,
            canvRadius: 100,
            canvWidth: 5, // circle thickness
            canvTextSize: 40,
            dayRadiusOffset: 60,

            line1: {
                circleIcon: 'network',
                circleUrlIcon: null,
                label: "话费余额",
                unit: "元",
            },
            line2: {
                circleIcon: 'waveform.path.badge.minus',
                circleUrlIcon: null,
                label: "通用流量",
                unit: "M",
            }

        }
        this.configLight = {
            backgroundColor: new Color('#fff'),
            textColor: new Color('#000'),
            line1: {
                fgCircleColor: new Color('#dddef3'),
                percentColor: new Color('#000'),
                circleColor: new Color('#1a7bf3'),
                iconColor: new Color('#1a7bf3'),
                textColor: new Color('#000'),
            },
            line2: {
                fgCircleColor: new Color('#dddef3'),
                percentColor: new Color('#000'),
                circleColor: new Color('#1a7bf3'),
                iconColor: new Color('#1a7bf3'),
                textColor: new Color('#000'),
            }
        }
        this.configDark = {
            backgroundColor: new Color('#1c1c1e'),
            textColor: new Color('#eaeaea'),
            line1: {
                fgCircleColor: new Color('#fff'),
                percentColor: new Color('#eaeaea'),
                circleColor: new Color('#1a7bf3'),
                iconColor: new Color('#1a7bf3'),
                textColor: new Color('#eaeaea'),
            },
            line2: {
                fgCircleColor: new Color('#fff'),
                percentColor: new Color('#eaeaea'),
                circleColor: new Color('#1a7bf3'),
                iconColor: new Color('#1a7bf3'),
                textColor: new Color('#eaeaea'),
            }
        }

        this.registerAction('地址设置', this.actionSetting.bind(this))
        this.registerAction('外观设置', this.themeSetting.bind(this))
    }

    /**
     * 渲染函数，函数名固定
     * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
     */
    async render() {
        const data = await this.getData()
        switch (this.widgetFamily) {
            case 'large':
                return await this.renderLarge(data)
            case 'medium':
                return await this.renderMedium(data)
            default:
                return await this.renderSmall(data)
        }
    }

    /**
     * 渲染小尺寸组件
     */
    async renderSmall(data) {

        var config = this.configLight
        if (await this.isUsingDark()) {
            config = this.configDark
        }

        let w = new ListWidget()
        w.backgroundColor = config.backgroundColor

        let balance = w.addStack()
        await this.renderLine(balance, data.totalRatio, data.balance, this.config.line1.unit, this.config.line1, config.line1)

        let r2 = w.addStack()
        await this.renderLine(r2, data.generalRatio, data.generalRemainder, data.generalUnit, this.config.line2, config.line2)

        const stackDescFooter = w.addStack();
        stackDescFooter.centerAlignContent();

        stackDescFooter.addSpacer();
        const count = stackDescFooter.addText(`更新时间：${data.createTime}`)
        count.font = Font.lightSystemFont(10)
        count.textColor = config.textColor
        stackDescFooter.addSpacer();

        return w
    }

    /**
     * 渲染中尺寸组件
     */
    async renderMedium(data, num = 3) {
        let w = new ListWidget()
        w.addText("待开发")
        return w
    }

    /**
     * 渲染大尺寸组件
     */
    async renderLarge(data) {
        return await this.renderMedium(data, 10)
    }

    /**
     * 获取数据函数，函数名可不固定
     */
    async getData() {

        var data = {
            "code": 200,
            "data": {
                "username": "",
                "use": 0,
                "total": 0,
                "generalUse": 0,
                "generalTotal": 0,
                "specialUse": 0,
                "specialTotal": 0,
                "balance": 0,
                "voiceUsage": 0,
                "voiceAmount": 0,
                "createTime": "0000-00-00 00:00:00"
            }
        }

        const settings = this.getSettings()
        const api = settings["url"] || ""
        if (api !== "") {
            data = await this.httpGet(api, true, false)
        }

        var d = data.data

        let balance = (d.balance / 100).toFixed(2)
        let totalRatio = (d.total - d.use) / d.total * 100
        totalRatio = (totalRatio | 0)
        let generalRatio = (d.generalTotal - d.generalUse) / d.generalTotal * 100
        generalRatio = (generalRatio | 0)
        let generalRemainder = d.generalTotal - d.generalUse
        let generalUnit = 'KB'
        if (generalRemainder > 1048576) {
            generalRemainder = generalRemainder / 1024 / 1024
            generalUnit = "GB"
        } else if (generalRemainder > 1024) {
            generalRemainder = generalRemainder / 1024
            generalUnit = "MB"
        }

        let getDataTime = new Date(d.createTime.replace(/-/g, '/'))

        let month = (getDataTime.getMonth() | 0)
        let day = (getDataTime.getDay() | 0)
        let hours = (getDataTime.getHours() | 0)
        let minutes = (getDataTime.getMinutes() | 0)

        let createTime = hours + ":" + (minutes.toString().length > 1 ? minutes : '0' + minutes)
        let newDate = new Date()
        if (newDate.getDay() !== day || newDate.getMonth() !== month) {
            createTime = (month.toString().length > 1 ? month : '0' + month) + '/' + (day.toString().length > 1 ? day : '0' + day) + ' ' + createTime
        }
        return {
            balance: balance,
            totalRatio: (totalRatio).toFixed(0),
            generalRatio: (generalRatio).toFixed(0),
            generalRemainder: (generalRemainder).toFixed(2),
            generalUnit: generalUnit,
            createTime: createTime
        }
    }

    /**
     * 自定义注册点击事件，用 actionUrl 生成一个触发链接，点击后会执行下方对应的 action
     * @param {string} url 打开的链接
     */
    async actionOpenUrl(url) {
        Safari.openInApp(url, false)
    }

    async renderLine(stack, ratio, value, unit, configLine, configTheme) {
        const stackCircle = stack.addStack();
        const canvas = await this.makeCanvas();
        stackCircle.size = new Size(70, 70);
        this.makeCircle(
            canvas,
            this.config.dayRadiusOffset,
            ratio * 3.6,
            configTheme
        );
        this.drawText(ratio, canvas, 75, 18, configTheme);
        this.drawPointText(`%`, canvas, new Point(65, 50), 14, configTheme);
        stackCircle.backgroundImage = canvas.getImage();
        //
        stackCircle.setPadding(20, 0, 0, 0);
        stackCircle.addSpacer();

        const icon = configLine.circleUrlIcon
            ? {image: configLine.circleUrlIcon}
            : SFSymbol.named(configLine.circleIcon);
        const imageIcon = stackCircle.addImage(icon.image);

        imageIcon.tintColor = configTheme.iconColor;
        imageIcon.imageSize = new Size(15, 15);
        canvas.drawImageInRect(icon.image, new Rect(110, 80, 60, 60));
        stackCircle.addSpacer();

        stack.addSpacer(5);
        const stackDesc = stack.addStack();
        stackDesc.size = new Size(70, 60);
        stackDesc.centerAlignContent();
        stackDesc.layoutVertically();
        stackDesc.addSpacer(10);


        const label = stackDesc.addText(configLine.label)
        label.font = Font.mediumSystemFont(12)
        label.textColor = configTheme.textColor

        stackDesc.addSpacer(10);

        const stackDescFooter = stackDesc.addStack();
        stackDescFooter.centerAlignContent();


        const count = stackDescFooter.addText(`${value}`)
        count.font = Font.mediumSystemFont(16)
        count.textColor = configTheme.textColor
        stackDescFooter.addSpacer(2);


        const unitText = stackDescFooter.addText(`${unit}`)
        unitText.font = Font.mediumSystemFont(8)
        unitText.textColor = configTheme.textColor

        return stackCircle
    }

    async makeCanvas() {
        const canvas = new DrawContext();
        canvas.opaque = false;
        canvas.respectScreenScale = true;
        canvas.size = new Size(this.config.canvSize, this.config.canvSize);
        return canvas;
    }

    makeCircle(canvas, radiusOffset, degree, configTheme) {
        let ctr = new Point(this.config.canvSize / 2, this.config.canvSize / 2);
        // Outer circle
        const bgx = ctr.x - (this.config.canvRadius - radiusOffset);
        const bgy = ctr.y - (this.config.canvRadius - radiusOffset);
        const bgd = 2 * (this.config.canvRadius - radiusOffset);
        const bgr = new Rect(bgx, bgy, bgd, bgd);
        canvas.setStrokeColor(configTheme.fgCircleColor);
        canvas.setLineWidth(2);
        canvas.strokeEllipse(bgr);
        // Inner circle
        canvas.setFillColor(configTheme.circleColor);
        for (let t = 0; t < degree; t++) {
            const rect_x =
                ctr.x +
                (this.config.canvRadius - radiusOffset) * this.sinDeg(t) -
                this.config.canvWidth / 2;
            const rect_y =
                ctr.y -
                (this.config.canvRadius - radiusOffset) * this.cosDeg(t) -
                this.config.canvWidth / 2;
            const rect_r = new Rect(rect_x, rect_y, this.config.canvWidth, this.config.canvWidth);
            canvas.fillEllipse(rect_r);
        }
        return canvas
    }

    sinDeg(deg) {
        return Math.sin((deg * Math.PI) / 180);
    }

    cosDeg(deg) {
        return Math.cos((deg * Math.PI) / 180);
    }

    drawText(txt, canvas, txtOffset, fontSize, configTheme) {
        const txtRect = new Rect(
            this.config.canvTextSize / 2 - 20,
            txtOffset - this.config.canvTextSize / 2,
            this.config.canvSize,
            this.config.canvTextSize,
        );
        canvas.setTextColor(configTheme.percentColor);
        canvas.setFont(Font.boldSystemFont(fontSize));
        canvas.setTextAlignedCenter();
        canvas.drawTextInRect(`${txt}`, txtRect);
    }

    drawPointText(txt, canvas, txtPoint, fontSize, configTheme) {
        canvas.setTextColor(configTheme.percentColor);
        canvas.setFont(Font.boldSystemFont(fontSize));
        canvas.drawText(txt, txtPoint);
    }

    async actionSetting() {
        const settings = this.getSettings()
        const arg = settings["url"] || ""
        let a = new Alert()
        a.title = "设置地址"
        a.message = "输入ChinaTelecomMonitor访问地址"
        a.addTextField("", arg)
        a.addAction("确认");
        await a.presentAlert();
        let result = a.textFieldValue(0);
        this.settings["url"] = String(result)
        this.saveSettings()
    }

    async themeSetting() {
        let a = new Alert()
        const settings = this.getSettings()
        const theme = Number(settings["theme"] === null ? 2 : settings["theme"])
        a.title = "外观设置"
        a.message = "自动适应，现版本有一个官方bug，暂不推荐使用"
        a.addAction((theme === 0 ? '✅ ' : '') + "保持浅色")
        a.addAction((theme === 1 ? '✅ ' : '') + "保持深色")
        a.addAction((theme === 2 ? '✅ ' : '') + "自动适应")
        a.addAction((theme === 3 ? '✅ ' : '') + "自定义")
        a.addCancelAction("取消操作")
        let i = await a.presentSheet()
        let themeTime
        if (i === -1) return
        switch (i) {
            case 0:
                break;
            case 1:
                break
            case 2:
                break
            case 3:
                themeTime = await this.themeTimeSetting()
                break
            default:
                return
        }

        this.settings["theme"] = i
        if (themeTime !== null) {
            this.settings["themeTime"] = String(themeTime)
        }
        this.saveSettings()
    }


    async themeTimeSetting() {
        const settings = this.getSettings()
        const arg = settings["themeTime"] || "7:00-22:00"
        let a = new Alert()
        a.title = "自定义"
        a.message = "输入浅色开始时间到结束时间，例如：'7:00-22:00'"
        a.addTextField("7:00-22:00", arg)
        a.addAction("确认");
        await a.presentAlert();
        return a.textFieldValue(0);
    }

    async isUsingDark() {
        const settings = this.getSettings()
        const theme = Number(settings["theme"] === null ? 2 : settings["theme"])
        var flag
        switch (theme) {
            case 0:
                flag = false
                break
            case 1:
                flag = true
                break
            case 2:
                flag = await Device.isUsingDarkAppearance()
                break
            case 3:
                const themeTime = settings["themeTime"] || "7:00-22:00"
                let result = themeTime.trim().match(/^(\d{1,2}):(\d{1,2})-(\d{1,2}):(\d{1,2})$/)
                if (result === null) {
                    console.log("外观设置-自适应 输入(" + themeTime + ")格式有误，无法解析。启动自动适应模式")
                    flag = await Device.isUsingDarkAppearance()
                    break
                }
                let date = new Date()
                let themeTimeStartHours = Number(result[1])
                let themeTimeStartMinutes = Number(result[2])
                let themeTimeEndHours = Number(result[3])
                let themeTimeEndMinutes = Number(result[4])

                if (themeTimeStartHours < themeTimeEndHours || (themeTimeStartHours === themeTimeEndHours && themeTimeStartMinutes < themeTimeEndMinutes)) {
                    flag = !((date.getHours() > themeTimeStartHours || (date.getHours() === themeTimeStartHours && date.getMinutes() > themeTimeStartMinutes))
                        && (date.getHours() < themeTimeEndHours || (date.getHours() === themeTimeEndHours && date.getMinutes() < themeTimeEndMinutes)))
                } else {
                    flag = (date.getHours() < themeTimeStartHours || (date.getHours() === themeTimeStartHours && date.getMinutes() < themeTimeStartMinutes))
                        && (date.getHours() > themeTimeEndHours || (date.getHours() === themeTimeEndHours && date.getMinutes() > themeTimeEndMinutes))
                }
                break
            default:
                flag = await Device.isUsingDarkAppearance()
                break
        }
        return flag
    }


    // async isUsingDarkAppearance() {
    //     const wv = new WebView()
    //     let js ="(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)"
    //     let r = await wv.evaluateJavaScript(js)
    //     return r
    // }

}

// @组件代码结束

const {Testing} = require("./「小件件」开发环境")
await Testing(Widget)