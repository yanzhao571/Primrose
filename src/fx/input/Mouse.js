/* global Primrose, THREE */

Primrose.Input.Mouse = ( function () {
  function MouseInput ( name, DOMElement, commands, socket, oscope ) {
    DOMElement = DOMElement || window;
    Primrose.Input.ButtonAndAxis.call( this, name, commands, socket,
        oscope, 1, MouseInput.AXES );

    this.setLocation = function ( x, y ) {
      this.setAxis( "X", x );
      this.setAxis( "Y", y );
    };

    this.setMovement = function ( dx, dy ) {
      this.setAxis( "X", dx + this.getAxis( "X" ) );
      this.setAxis( "Y", dy + this.getAxis( "Y" ) );
    };

    this.readEvent = function ( event ) {
      this.setAxis( "BUTTONS", event.buttons );
      if ( MouseInput.isPointerLocked() ) {
        var mx = event.movementX,
            my = event.movementY;
        
        if ( mx === undefined ) {
          mx = event.webkitMovementX || event.mozMovementX || 0;
          my = event.webkitMovementY || event.mozMovementY || 0;
        } 
        this.setMovement( mx, my );
      }
      else {
        this.setLocation( event.layerX, event.layerY );
      }
    };

    DOMElement.addEventListener( "mousedown", function ( event ) {
      this.setButton( event.button, true );
      this.setAxis( "BUTTONS", event.buttons );
    }.bind( this ), false );

    DOMElement.addEventListener( "mouseup", function ( event ) {
      this.setButton( event.button, false );
      this.setAxis( "BUTTONS", event.buttons );
    }.bind( this ), false );

    DOMElement.addEventListener( "mousemove", this.readEvent.bind( this ), false );

    DOMElement.addEventListener( "mousewheel", function ( event ) {
      this.setAxis( "Z", this.getAxis( "Z" ) + event.wheelDelta );
      this.readEvent( event );
    }.bind( this ), false );

    this.addEventListener = function ( event, handler, bubbles ) {
      if ( event === "pointerlockchange" ) {
        if ( document.exitPointerLock ) {
          document.addEventListener(
              'pointerlockchange',
              handler,
              bubbles );
        }
        else if ( document.mozExitPointerLock ) {
          document.addEventListener(
              'mozpointerlockchange',
              handler,
              bubbles );
        }
        else if ( document.webkitExitPointerLock ) {
          document.addEventListener(
              'webkitpointerlockchange',
              handler,
              bubbles );
        }
      }
    };

    this.removeEventListener = function ( event, handler, bubbles ) {
      if ( event === "pointerlockchange" ) {
        if ( document.exitPointerLock ) {
          document.removeEventListener(
              'pointerlockchange',
              handler,
              bubbles );
        }
        else if ( document.mozExitPointerLock ) {
          document.removeEventListener(
              'mozpointerlockchange',
              handler,
              bubbles );
        }
        else if ( document.webkitExitPointerLock ) {
          document.removeEventListener(
              'webkitpointerlockchange',
              handler,
              bubbles );
        }
      }
    };

    DOMElement.requestPointerLock = DOMElement.requestPointerLock ||
        DOMElement.webkitRequestPointerLock ||
        DOMElement.mozRequestPointerLock ||
        function () {
        };

    this.requestPointerLock = function () {
      if ( !MouseInput.isPointerLocked() ) {
        DOMElement.requestPointerLock();
      }
    };

    this.exitPointerLock = ( document.webkitExitPointerLock ||
        document.mozExitPointerLock ||
        document.exitPointerLock ||
        function () {
        } ).bind( document );

    this.togglePointerLock = function () {
      if ( MouseInput.isPointerLocked() ) {
        this.exitPointerLock();
      }
      else {
        this.requestPointerLock();
      }
    };
  }

  MouseInput.isPointerLocked = function () {
    return !!( document.pointerLockElement ||
        document.webkitPointerLockElement ||
        document.mozPointerLockElement );
  };
  MouseInput.AXES = [ "X", "Y", "Z", "BUTTONS" ];
  Primrose.Input.ButtonAndAxis.inherit( MouseInput );

  return MouseInput;
} )();
