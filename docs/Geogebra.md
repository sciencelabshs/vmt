# VMT + GeoGebra

GeoeGebra provides one of the workspaces in which collaborative math can be done.
To get an overview visit [GeoGebra](http://www.geogebra.org) or read their API [docs]()

## Overview

The following document is intended to help anyone working on the GeoGebra applet embedded in VMT. It is organized as follows:

1. Location in the codebase
1. GgbGraph.js Explanation

- render()
- onScriptLoad()
- initializeGgb()

- componentDidMount()
- componentDidUpdate()

Inlcuding a GeoGebra app in React app is a bit of a hack. Their API updates the dom directly rather than via React's virtual DOM. On top of this, everything that happens inside the GeoGebra code is blocking. This is why we sometimes wrap geogebra updates in a `setTimout({}, 0)` ... so that our other UI updates can happen first.

## Location in the codebase

`./client/src/containers/workspace/` cotains all of the code related to geogebra. Specifically `ggbGraph.js` `ggbActivityGraph.js`, `ggbReplayer.js`, and `ggbUtils` These graphs are sent to workspace layout (in `./client/src/layout/workspace) as render props.

## **GgbGraph.js**

GgbGraph is where the magic happens. This Component receives information about the "Room" and a socket connection as props. It listens for updates to the GeoGebra construction and emits those updates to other users in the room. It also has a listener for receiving those events and then updating the construction accordingly.

**render()**

The render method simply returns a `<Script>` component which loads the GeoGebra app (or a loading incon if it hasn't loaded yet).

**onScriptLoad()**

This method constructs a parameters object and creates a GeoGebra instance. For a list of valid paramters look [here](https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters). The `appletOnLoad` parameter designates the function to run once the instance has succesfully been created. We pass in `this.initializeGgb`

**initializeGgb()**

<a name="sendEvnet"></a>

**sendEvent(xml, definition, label, eventType, action)**

creates a buffer multippart events like drags and shape creation

| Param      | Type                | Description                                                                              |
| ---------- | ------------------- | ---------------------------------------------------------------------------------------- |
| xml        | <code>String</code> | ggb generated xml of the even                                                            |
| definition | <code>String</code> | ggb multipoint definition (e.g. "Polygon(D, E, F, G)")                                   |
| label      | <code>String</code> | ggb label. ggbApplet.evalXML(label) yields xml representation of this label              |
| eventType  | <code>String</code> | ["ADD", "REMOVE", "UPDATE", "CHANGE_PERSPECTIVE", "NEW_TAB", "BATCH"] see ./models/event |
| action     | <code>String</code> | ggb action ["Add", "Remove", "Click", "Update"]                                          |

### add, remove, click, and update listeners (and registerListerners)

### perspectiveChanged

### ComponentDidMount

Here we initialize the updateDimensions() method as the event handler when the window is resized
and the 'RECEIVE_EVENT' socket listener.

**socket.on('RECEIVE_EVENT', data)**

This method listens for events coming over the socket and either applies those events immediately based on the data.eventType or, if we're still in the process of applying the last event to come over the socket (as indicated by the values of `this.batchUpdating` or `this.receivingData`) it adds the event to `this.socketQueue`. Bacth updates occur by invoking from `recursiveUpdate(events, eventType)` and when the recursiveUpdate function finishes, it checks `this.socketQueue` for events and applies them one at a time.

**recursiveUpdate(event, eventType)**

applies multiple events sequenetially. Needed for making dragging look smoothe

| Param      | Type                      | Description                                                        |
| ---------- | ------------------------- | ------------------------------------------------------------------ |
| events     | <code>Array/Object</code> | array of ggb generated xml events, commands, or a VMT event Object |
| updateType | <code>String</code>       | 'ADDING' invokes evalCommand. Null invokes evalXML                 |

- Set `checkSocketQueue = true` so after we've made our updates we know to look at the socketQueue for events that came in while making the current update.
- IF events === Array
  - IF updateType === 'ADDING'
    - loop over event array calling evalCommand() on each event
  - ELSE take the first event from the event array and pass it to evalXML(). Then in a setTimeout(0) pass the remaining events to recursiveUpdate. We utilize setTimeout to ensure that evalXML has finished before moving on to the next event. (Still unclear if this is necessary). We also set `checkSocketQueue = false` because we are still applying events from this array and are not yet ready to check the socketQueue.
- ELSE IF events === Object, exalXML()
- IF checkSocketQueue and socketQueue.length > 0
  - Take the first event off the socket queue
  - determine the event Type i.e. 'ADDING' or null and Array or Object
  - call recrusiveUpdate
- ELSE {
  all updating is done including the socket queue.
  set receivingData and batchUpdating to false
  }
