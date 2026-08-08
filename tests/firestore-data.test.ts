import assert from "node:assert/strict";
import test from "node:test";

import { removeUndefinedFirestoreValues } from "../lib/firebase/firestore-data";

test("removes undefined values from nested Firestore payloads", () => {
  const cleaned = removeUndefinedFirestoreValues({
    name: "Personalized Engraved Plaque",
    sampleImages: [
      {
        id: "sample-custom",
        src: "/products/plaque-custom.png",
        storagePath: undefined,
      },
      undefined,
      {
        id: "uploaded",
        src: "https://storage.googleapis.com/example/site/product-images/upload.webp",
        storagePath: "site/product-images/upload.webp",
      },
    ],
    nested: {
      keep: null,
      drop: undefined,
      list: ["a", undefined, "b"],
    },
  });

  assert.deepEqual(cleaned, {
    name: "Personalized Engraved Plaque",
    sampleImages: [
      {
        id: "sample-custom",
        src: "/products/plaque-custom.png",
      },
      {
        id: "uploaded",
        src: "https://storage.googleapis.com/example/site/product-images/upload.webp",
        storagePath: "site/product-images/upload.webp",
      },
    ],
    nested: {
      keep: null,
      list: ["a", "b"],
    },
  });
});
