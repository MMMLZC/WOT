// client.js
// Required steps to create a servient for a client
const { Servient, Helpers } = require("@node-wot/core");
const { HttpClientFactory } = require("@node-wot/binding-http");

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory(null));
const WoTHelpers = new Helpers(servient);

WoTHelpers.fetch("http://localhost:8080/counter")
  .then(async (td) => {
    try {
      servient.start().then(async (WoT) => {
        // Then from here on you can consume the thing
        // i.e let thing = await WoT.consume(td) ...
        const thing = await WoT.consume(td);
        console.info("=== TD ===");
        console.info(td);
        console.info("==========");
        // read property #1
        const read1 = await thing.readProperty("count");
        console.log("count value is", await read1.value());
        // increment property #1 (without step)
        await thing.invokeAction("increment");
        const inc1 = await thing.readProperty("count");
        console.info("count value after increment #1 is", await inc1.value());
        // increment property #2 (with step)
        await thing.invokeAction("increment", undefined, {
          uriVariables: { step: 3 },
        });
        const inc2 = await thing.readProperty("count");
        console.info(
          "count value after increment #2 (with step 3) is",
          await inc2.value()
        );
        // look for the first form for decrement with CoAP binding
        await thing.invokeAction("decrement", undefined, {
          formIndex: getFormIndexForDecrementWithCoAP(thing),
        });
        const dec1 = await thing.readProperty("count");
        console.info("count value after decrement is", await dec1.value());
      });
    } catch (err) {
      console.error("Script error:", err);
    }
  })
  .catch((err) => {
    console.error("Fetch error:", err);
  });

function getFormIndexForDecrementWithCoAP(thing) {
  const forms = thing.getThingDescription().actions.decrement.forms;
  for (let i = 0; i < forms.length; i++) {
    if (/^coaps?:\/\/.*/.test(forms[i].href)) {
      return i;
    }
  }
  // return formIndex: 0 if no CoAP target IRI found
  return 0;
}
