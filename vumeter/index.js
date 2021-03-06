new Vue({
  el: '#app',
  data: {
    peakLeftVal: -59,
    peakRightVal: -59,
    leftVal: -60,
    rightVal: -60,
    clipSize: 10,
    showPeaks: true,
    meterWidth: 20,
    timerLeft: undefined,
    timerRight: undefined
  },
  watch: {
    leftVal: {
      handler (newVal, oldVal) {
        if (this.showPeaks) {
          var smoothingFactor = 25;
          if (newVal > this.peakLeftVal) {
            this.peakLeftVal = newVal;
          } else {
            this.peakLeftVal = this.peakLeftVal + (newVal - this.peakLeftVal) / smoothingFactor;
          }
        }
      }
    },
    rightVal: {
      handler (newVal, oldVal) {
        if (this.showPeaks) {
          var smoothingFactor = 25;
          if (newVal > this.peakRightVal) {
            this.peakRightVal = newVal;
          } else {
            this.peakRightVal =
              newVal * (1 / smoothingFactor) +
              this.peakRightVal * ((smoothingFactor - 1) / smoothingFactor);
          }
        }
      }
    }
  },
  directives: {
    async drawMeter (canvas, binding) {
      await Vue.nextTick()
      var clipSize = binding.value.clipSize;
      var showPeaks = binding.value.showPeaks;
      var amp = binding.value.amp / 60 + 1;
      var peak = binding.value.peak / 60 + 1;
      var w = canvas.width;
      var h = canvas.height;
      var hInRange = h - clipSize;
      var ctx = canvas.getContext("2d");
      var gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "red");
      gradient.addColorStop(clipSize / h, "orange");
      gradient.addColorStop(clipSize / h, "greenyellow");
      gradient.addColorStop(1, "lime");
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, h - hInRange * amp, w, hInRange * amp);
      if (showPeaks) {
        if (peak >= 1) {
          ctx.fillStyle = "red";
        } else {
          ctx.fillStyle = "#FADE06";
        }
        ctx.fillRect(0, Math.round(h - hInRange * peak), w, 1);
      }
      ctx.fillStyle = "white";
      ctx.fillRect(0, clipSize, w, 1);
    }
  },
  mounted () {
    this.drawRuler({
      canvasId: 'audio-ruler',
      strokeStyle: '#fff',
      fillStyle: '#fff',
      width: 40,
      height: 200
    })
    document.querySelectorAll('.audio-meter').forEach(ele => {
      ele.height = document.querySelector('#audio-ruler').height / 2 - 10
    })
    document.onkeydown = (e) => {
      if (e.keyCode === 32) {
        if (this.timerLeft && this.timerLeft.id !== undefined) {
          this.stop()
        } else {
          this.begin()
        }
      }
    }
  },
  methods: {
    begin () {
      this.stop()
      this.generateAmp('left')
      this.generateAmp('right')
    },
    stop () {
      clearAnimationFrame(this.timerLeft)
      clearAnimationFrame(this.timerRight)
      if (this.timerLeft) {
        this.timerLeft.id = undefined
        this.timerRight.id = undefined
      }
    },
    drawRuler (options = {}) {
      const {
        canvasId = 'canvas',
        lineXPosition = 0,                  // ?????????????????????????????????
        lineYPosition = 10,                 // ?????????????????????????????????
        lineYPosition2 = 10,                // ?????????????????????????????????
        numRulerXDistance = 23,
        numRulerYDistance = 2,
        tickNumber = 60,                    // ???????????????
        largeScaleHeight = 10,              // ???????????????
        smallScaleHeight = 5,               // ???????????????
        smallScaleNumsPerLargeScale = 6,    // ?????????????????????????????????
        fontSize = 12,
        strokeStyle = '#000',
        fillStyle = '#000',
        width = 40,
        height = 200
      } = options;
      const canvas = document.getElementById(canvasId);
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      canvas.width = width * 2
      canvas.height = height * 2
      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2)
      const rulerHeight = canvas.offsetHeight - lineYPosition - lineYPosition2;
      // ???????????????????????????
      const smallScaleWidth = rulerHeight / tickNumber;
      let lastTopRulerPos = 0;
      let textPos = 0;
      // ??????????????????
      let index = 0;
      //????????????
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.font = fontSize + "px Source Han Sans CN";
      ctx.strokeStyle = strokeStyle;
      ctx.fillStyle = fillStyle;
      ctx.textAlign = "center";

      ctx.beginPath();

      lastTopRulerPos = lineYPosition + index * smallScaleWidth;

      while (lastTopRulerPos <= rulerHeight + lineYPosition + lineYPosition2 && index <= tickNumber) {
        // ????????????????????????0.5?????????
        if (index % smallScaleNumsPerLargeScale == 0) {
          // ??????????????????
          ctx.moveTo(lineXPosition, lastTopRulerPos);
          ctx.lineTo(lineXPosition + largeScaleHeight, lastTopRulerPos);

          ctx.fillText(
            index === 0 ? '0': textPos,
            lineXPosition + numRulerXDistance,
            lastTopRulerPos + numRulerYDistance
          );

          textPos -= smallScaleNumsPerLargeScale;
        } else {
          // ??????????????????
          ctx.moveTo(lineXPosition, lastTopRulerPos);
          ctx.lineTo(lineXPosition + smallScaleHeight, lastTopRulerPos);
        }
        index++;
        lastTopRulerPos = lineYPosition + index * smallScaleWidth;
        ctx.stroke();
      }

      // ????????????????????????????????????????????????????????????????????????
      lastTopRulerPos = lineYPosition + tickNumber * smallScaleWidth;

      // ?????????????????????
      ctx.moveTo(lineXPosition, lineYPosition); // ??????
      ctx.lineTo(lineXPosition, lastTopRulerPos); // ??????

      ctx.stroke();
    },
    generateAmp (type) {
      if (type === 'left') {
        this.timerLeft = setAnimationFrame(() => {
          this.leftVal = getRandomInt(-60, 0)
        }, 200)
      } else {
        this.timerRight = setAnimationFrame(() => {
          this.rightVal = getRandomInt(-60, 0)
        }, 200)
      }
    }
  }
})
