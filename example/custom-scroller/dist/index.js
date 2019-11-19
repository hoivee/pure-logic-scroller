(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.CustomScroller = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var rAF = // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

  var getTime = // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  Date.now || function getTime() {
    return new Date().getTime();
  };

  function getNumberSign(number) {
    if (number > 0) {
      return 1;
    } else if (number < 0) {
      return -1;
    } else {
      return 0;
    }
  }

  var Impulse =
  /** @class */
  function () {
    function Impulse(length) {
      this.eventList = [];

      for (var i = 0; i < length; i++) {
        this.eventList.push({
          position: 0,
          timeStamp: 0
        });
      }

      this.tail = 0;
      this.length = 0;
      this.maxLength = length;
    }

    Impulse.prototype.push = function (position, timeStamp) {
      var currentItem = this.eventList[this.tail];
      currentItem.position = position;
      currentItem.timeStamp = timeStamp;
      this.tail = (this.tail + 1) % this.maxLength;

      if (this.length < this.maxLength) {
        this.length++;
      }

      return this.length;
    };

    Impulse.prototype.getImpulse = function () {
      var impulse = 0;
      var length = this.length;

      if (length > 1) {
        var lastEvent = this.getItem(0);

        if (lastEvent === null) {
          return 0;
        }

        if (getTime() - lastEvent.timeStamp < 34) {
          var startPos = void 0;

          for (startPos = 1; startPos < length - 1; startPos++) {
            var event_1 = this.getItem(startPos);

            if (event_1 === null) {
              return 0;
            }

            var pastTime = lastEvent.timeStamp - event_1.timeStamp;

            if (pastTime > 100) {
              break;
            }
          }

          var endPosItem = lastEvent;
          var startPostItem = this.getItem(startPos);

          if (startPostItem === null) {
            return 0;
          }

          impulse = (endPosItem.position - startPostItem.position) / (endPosItem.timeStamp - startPostItem.timeStamp);
        }
      }

      return impulse;
    }; // 按索引取得队列项，队尾索引值为0


    Impulse.prototype.getItem = function (index) {
      if (index + 1 > this.length) {
        return null;
      }

      var maxLength = this.maxLength;
      var currentIndex = (this.tail - 1 - index + maxLength) % maxLength;
      return this.eventList[currentIndex];
    };

    Impulse.prototype.clear = function () {
      this.tail = 0;
      this.length = 0;
    };

    return Impulse;
  }();

  var ScrollerCore =
  /** @class */
  function () {
    function ScrollerCore(containerLength, contentLength, config) {
      var _this = this;

      if (config === void 0) {
        config = {
          bounceTime: 500,
          offsetMultiplyForOverEdge: 0.2,
          maxBounceOffsetMul: 0.06,
          maxBounceDurationMul: 3,
          minScrollDuration: 500,
          impulseDurationMul: 600,
          impulseOffsetMul: 300
        };
      }

      this.config = config;
      this.impulseController = new Impulse(30);
      this.offsetMultiply = 1;

      this.overTest = function () {
        var isOver = _this.isOver(_this.scrollerRender.currentPosition, _this.leftCallback, _this.rightCallback);

        if (isOver) {
          _this.runOverAction();
        }
      };

      this.overRangeCallback = function () {
        _this.offsetMultiply = _this.config.offsetMultiplyForOverEdge;
      };

      this.leftCallback = function () {
        _this.scrollerRender.renderScrollTo(0, _this.config.bounceTime);
      };

      this.rightCallback = function () {
        _this.scrollerRender.renderScrollTo(_this.compare, _this.config.bounceTime);
      };

      this.runOverAction = function () {
        if (typeof _this.overActionLeft === 'function') {
          _this.overActionLeft();

          _this.overActionLeft = null;
        }

        if (typeof _this.overActionRight === 'function') {
          _this.overActionRight();

          _this.overActionRight = null;
        }
      };

      this.contentLength = 0;
      this.containerLength = 0;
      this.lastMovePosition = 0;
      this.overActionLeft = null;
      this.overActionRight = null;
      this.init(containerLength, contentLength);
    }

    ScrollerCore.prototype.init = function (containerLength, contentLength) {
      var _this = this;

      this.contentLength = contentLength;
      this.containerLength = containerLength;
      var compare = this.compare = containerLength - contentLength;

      if (compare < 0) {
        this.isOver = function (position, leftCallback, rightCallback) {
          if (position > 0) {
            _this.overActionLeft = leftCallback;
            return true;
          } else if (position < compare) {
            _this.overActionRight = rightCallback;
            return true;
          } else {
            return false;
          }
        };
      } else {
        this.isOver = function (position, leftCallback, rightCallback) {
          if (position < 0) {
            _this.overActionLeft = leftCallback;
            return true;
          } else if (position > compare) {
            _this.overActionRight = rightCallback;
            return true;
          } else {
            return false;
          }
        };
      }
    };

    ScrollerCore.prototype.scrollBy = function (positionChange, duration, easeFn) {
      var currentPosition = this.scrollerRender.currentPosition;
      var targetPosition = currentPosition + positionChange;
      this.scrollTo(targetPosition, duration, easeFn);
    };

    ScrollerCore.prototype.scrollTo = function (position, duration, easeFn) {
      var currentPosition = this.scrollerRender.currentPosition;
      var targetPosition = position;
      var positionChange = position - currentPosition;

      if (this.isOver(currentPosition)) {
        this.overTest();
        return;
      } else if (positionChange === 0) {
        return;
      } else {
        var userImpulse = this.userImpulse;
        var impulse // 限制最大冲量为1
        = void 0; // 限制最大冲量为1

        if (userImpulse > 0 && userImpulse <= 1) {
          impulse = userImpulse;
        } else {
          impulse = 1;
        } // 反弹距离由用户滚动冲量和反弹位移倍增值决定


        var MAX_BOUNCE_OFFSET = this.containerLength * this.config.maxBounceOffsetMul * getNumberSign(positionChange) * impulse; // 重设用户滚动冲量

        this.userImpulse = 1;
        var positionChangeTest = targetPosition + MAX_BOUNCE_OFFSET;

        if (this.isOver(positionChangeTest)) {
          if (positionChange * getNumberSign(this.compare) < 0) {
            targetPosition = MAX_BOUNCE_OFFSET;
          } else {
            targetPosition = this.compare + MAX_BOUNCE_OFFSET;
          }

          duration = duration / (positionChange / MAX_BOUNCE_OFFSET) * this.config.maxBounceDurationMul;
        }
      } // 最小滚动时间为500ms


      var MIN_DURATION = this.config.minScrollDuration;
      var innerDuration = duration < MIN_DURATION ? MIN_DURATION : duration;
      this.scrollerRender.renderScrollTo(targetPosition, innerDuration, easeFn);
    };

    ScrollerCore.prototype.scrollByImpulse = function (impulse) {
      var DURATION_MUL = this.config.impulseDurationMul;
      var duration = impulse * DURATION_MUL;
      duration = Math.abs(duration);
      var IMPULSE_OFFSET_MUL = this.config.impulseOffsetMul;
      var positionChange = IMPULSE_OFFSET_MUL * impulse;
      this.userImpulse = impulse;
      this.scrollBy(positionChange, duration);
    };

    ScrollerCore.prototype.addPosition = function (position) {
      this.scrollerRender.stopScroll();
      this.offsetMultiply = 1;
      var isOver = this.isOver(this.scrollerRender.currentPosition, this.overRangeCallback, this.overRangeCallback);

      if (isOver) {
        this.runOverAction();
      }

      var currentPosition = this.scrollerRender.currentPosition;
      currentPosition = currentPosition + position * this.offsetMultiply;
      this.scrollerRender.currentPosition = currentPosition;
      this.scrollerRender.positionUpdateNotify(currentPosition);
    };

    ScrollerCore.prototype.pressStart = function (position) {
      this.lastMovePosition = position;
      this.scrollerRender.stopScroll();
    };

    ScrollerCore.prototype.pressMove = function (position, timeStamp) {
      this.addPosition(position - this.lastMovePosition);
      this.lastMovePosition = position;
      this.impulseController.push(position, timeStamp);
    };

    ScrollerCore.prototype.pressEnd = function (position, timeStamp) {
      var impulseController = this.impulseController;
      impulseController.push(position, timeStamp);
      var contentImpulse = impulseController.getImpulse();
      impulseController.clear();
      this.scrollByImpulse(contentImpulse);
    };

    ScrollerCore.prototype.useRender = function (render) {
      this.scrollerRender = render;
      render.install(this);
    };

    return ScrollerCore;
  }();

  var RAFMixer =
  /** @class */
  function () {
    function RAFMixer() {
      var _this = this;

      this.stepItems = [];
      this.preCount = 0;

      this.runSteps = function () {
        var now = getTime();
        var length = _this.stepItems.length;
        var stepCount = length;

        for (var i = length - 1; i > -1; i--) {
          var stepItem = _this.stepItems[i];

          if (stepItem.processing) {
            stepItem.step(now);
            stepItem.positionUpdateNotify();
          } else {
            _this.stepItems.splice(i, 1);

            stepCount--;
          }
        }

        if (stepCount > 0) {
          rAF(_this.runSteps);
        }
      };

      this.processStep = function () {
        _this.preCount--;

        if (_this.preCount === 0) {
          _this.runSteps();
        }
      };
    }

    RAFMixer.prototype.addStepItem = function (stepItem) {
      if (this.stepItems.indexOf(stepItem) === -1) {
        this.stepItems.push(stepItem);
        this.preCount++;
        rAF(this.processStep);
      }
    };

    return RAFMixer;
  }();

  var RAFMixer$1 = new RAFMixer();

  var easeTest = function cubicOut(t) {
    return --t * t * t + 1;
  };

  var RequestAnimationFrameRender =
  /** @class */
  function () {
    function RequestAnimationFrameRender(positionUpdateNotifyCallback) {
      var _this = this;

      this.processing = false;
      this.easeFn = easeTest;
      this.positionStart = 0;
      this.currentPosition = 0;
      this.positionChange = 0;
      this.duration = 0;
      this.startTimeStamp = 0;
      this.positionUpdateNotifyCallback = positionUpdateNotifyCallback;

      this.step = function (now) {
        var pastTime = now - _this.startTimeStamp;
        var progress = pastTime / _this.duration;

        if (progress > 1) {
          progress = 1;
        }

        _this.currentPosition = _this.easeFn(progress) * _this.positionChange + _this.positionStart;

        if (pastTime > _this.duration) {
          _this.currentPosition = Math.round(_this.currentPosition);
          _this.processing = false;

          _this.scrollerCore.overTest();
        }
      };
    }

    RequestAnimationFrameRender.prototype.install = function (scrollerCore) {
      this.scrollerCore = scrollerCore;
    };

    RequestAnimationFrameRender.prototype.positionUpdateNotify = function () {
      this.positionUpdateNotifyCallback(this.currentPosition);
    };

    RequestAnimationFrameRender.prototype.renderScrollTo = function (position, duration, easeFn) {
      if (easeFn === void 0) {
        easeFn = easeTest;
      }

      this.processing = true;
      this.easeFn = easeFn;
      this.duration = duration;
      this.startTimeStamp = getTime();
      var currentPosition = this.positionStart = this.currentPosition;
      this.positionChange = position - currentPosition;
      RAFMixer$1.addStepItem(this);
    };

    RequestAnimationFrameRender.prototype.stopScroll = function () {
      this.processing = false;
    };

    return RequestAnimationFrameRender;
  }();

  var MOVE_START_EVENT = ['touchstart', 'mousedown'];
  var MOVE_EVENT = ['touchmove', 'mousemove'];
  var MOVE_END_EVENT = ['touchend', 'mouseup'];
  var MOVE_CANCEL_EVENT = ['touchcancel', 'mouseup'];

  function setElementTranslate(contentStyle, transformProp, x, y) {
    contentStyle[transformProp] = "translate(".concat(x, "px, ").concat(y, "px)");
  }

  function standardizationEvent(event) {
    if (window.TouchEvent && event instanceof TouchEvent) {
      event.clientX = event.changedTouches[0].clientX;
      event.clientY = event.changedTouches[0].clientY;
    }
  }

  var ScrollerDomHandler =
  /*#__PURE__*/
  function () {
    function ScrollerDomHandler() {
      var _this = this;

      _classCallCheck(this, ScrollerDomHandler);

      this.container = document.getElementById('container');
      this.content = document.getElementById('content');
      this.contentStyle = this.content.style;
      this.containerRect = null;
      this.contentRect = null;
      this.transformProp = 'transform';
      this.events = [].concat(MOVE_EVENT, MOVE_END_EVENT, MOVE_CANCEL_EVENT);
      this.scrollerX = null;
      this.scrollerY = null;

      this.handleEvent = function (e) {
        if (_this.isPressDown && _this.events.indexOf(e.type) === -1) {
          return;
        }

        if (MOVE_EVENT.indexOf(e.type) !== -1) {
          _this.handlePressMove(e);
        } else if (MOVE_START_EVENT.indexOf(e.type) !== -1) {
          _this.handlePressStart(e);
        } else if (MOVE_END_EVENT.indexOf(e.type) !== -1) {
          _this.handlePressEnd(e);
        } else if (MOVE_CANCEL_EVENT.indexOf(e.type) !== -1) {
          _this.handlePressEnd(e);
        }
      };

      this.testTransformProp();
      this.computeRect();
      this.bindEvent();
      this.setScrollerCore();
    }

    _createClass(ScrollerDomHandler, [{
      key: "setScrollerCore",
      value: function setScrollerCore() {
        var _this2 = this;

        var x = 0,
            y = 0;

        var moveContentX = function moveContentX(position) {
          x = position;
          setElementTranslate(_this2.contentStyle, _this2.transformProp, x, y);
        };

        var moveContentY = function moveContentY(position) {
          y = position;
          setElementTranslate(_this2.contentStyle, _this2.transformProp, x, y);
        };

        this.scrollerX = new ScrollerCore(this.containerRect.width, this.contentRect.width);
        this.scrollerX.useRender(new RequestAnimationFrameRender(moveContentX));
        this.scrollerY = new ScrollerCore(this.containerRect.height, this.contentRect.height);
        this.scrollerY.useRender(new RequestAnimationFrameRender(moveContentY));
      }
      /**
       * 测试浏览器支持的 css `transform` 属性名
       */

    }, {
      key: "testTransformProp",
      value: function testTransformProp() {
        if ('transform' in this.contentStyle) {
          return;
        }

        var prefix = ['webkit', 'ms', 'moz', 'o'];
        var prefixCount = prefix.length;

        for (var index = 0; index < prefixCount; index++) {
          var transformProp = prefix[index] + 'Transform';

          if (transformProp in this.contentStyle) {
            this.transformProp = transformProp;
            return;
          }
        }
      }
    }, {
      key: "computeRect",
      value: function computeRect() {
        var containerStyle = getComputedStyle(this.container);
        var width = this.container.clientWidth - containerStyle.paddingLeft.replace('px', '') - containerStyle.paddingRight.replace('px', '');
        var height = this.container.clientHeight - containerStyle.paddingTop.replace('px', '') - containerStyle.paddingBottom.replace('px', '');
        this.containerRect = {
          width: width,
          height: height
        };
        this.contentRect = this.content.getBoundingClientRect();
      }
    }, {
      key: "bindEvent",
      value: function bindEvent() {
        var _this3 = this;

        this.events.forEach(function (event) {
          document.addEventListener(event, _this3.handleEvent);
        });
        MOVE_START_EVENT.forEach(function (event) {
          _this3.content.addEventListener(event, _this3.handleEvent);
        });
      }
    }, {
      key: "removeEvent",
      value: function removeEvent() {
        var _this4 = this;

        this.events.forEach(function (event) {
          document.removeEventListener(event, _this4.handleEvent);
        });
        MOVE_START_EVENT.forEach(function (event) {
          _this4.content.removeEventListener(event, _this4.handleEvent);
        });
      }
    }, {
      key: "handleEvent",
      value: function handleEvent(e) {
        if (this.events.indexOf(e.type) !== -1 && !this.isPressDown) {
          return;
        }

        if (MOVE_START_EVENT.includes(e.type)) {
          this.handlePressStart(e);
        } else if (MOVE_EVENT.includes(e.type)) {
          this.handlePressMove(e);
        } else if (MOVE_END_EVENT.includes(e.type)) {
          this.handlePressEnd(e);
        } else if (MOVE_CANCEL_EVENT.includes(e.type)) {
          this.handlePressEnd(e);
        }
      }
    }, {
      key: "handlePressStart",
      value: function handlePressStart(e) {
        standardizationEvent(e);
        var timeStamp = Date.now();
        this.isPressDown = true;
        this.scrollerY.pressStart(e.clientY, timeStamp);
        this.scrollerX.pressStart(e.clientX, timeStamp);
      }
    }, {
      key: "handlePressMove",
      value: function handlePressMove(e) {
        standardizationEvent(e);

        if (this.isPressDown) {
          var timeStamp = Date.now();
          this.scrollerY.pressMove(e.clientY, timeStamp);
          this.scrollerX.pressMove(e.clientX, timeStamp);
        }
      }
    }, {
      key: "handlePressEnd",
      value: function handlePressEnd(e) {
        standardizationEvent(e);
        var timeStamp = Date.now();
        this.isPressDown = false;
        this.scrollerY.pressEnd(e.clientY, timeStamp);
        this.scrollerX.pressEnd(e.clientX, timeStamp);
      }
    }]);

    return ScrollerDomHandler;
  }();

  return ScrollerDomHandler;

})));
