# 3D-modeller och licenser

Stadsdelen på `#/network` använder bara modeller som får användas gratis – även i
kommersiella projekt och i en betald produkt. Nedan står källa, licens och vad vi ändrat.

## CC0 1.0 (Public Domain Dedication)

CC0 kräver ingen attribution och inga avgifter. Vi anger källan ändå för spårbarhet.

| Fil | Modell | Källa | Ändringar |
| --- | --- | --- | --- |
| `bush.glb` | Bush | https://poly.pizza/m/ooG6CkLyE8 | texturer 512 px, fyra lövnyanser |
| `bush-flower.glb` | Bush with Flowers | https://poly.pizza/m/U1ymDy8tbY | texturer 512 px, fyra lövnyanser |
| `flowers.glb` | Flowers | https://poly.pizza/m/NBUxHir6FJ | texturer 512 px |
| `grass.glb` | Grass | https://poly.pizza/m/UGTOzcO3P2 | texturer 512 px |
| `pine.glb` | Pine Trees | https://poly.pizza/m/oYtDty0fR6 | texturer 512 px, färgjusterad |
| `tree-round.glb` | Tree (round canopy) | https://poly.pizza/m/aVOxaHRPWe | texturer 512 px, lövtoner |
| `tree-tall.glb` | Tree (tall canopy) | https://poly.pizza/m/qZtx0AHhcy | texturer 512 px, lövtoner |
| `car-sedan.glb` | Car | https://poly.pizza/m/unqqkULtRU | texturer 512 px, lackfärger |
| `car-taxi.glb` | Taxi | https://poly.pizza/m/x43lOScTpN | texturer 512 px |
| `person-woman.glb` | Woman Casual (11 animationer) | https://poly.pizza/m/jpKRgGDxhk | texturer 512 px |
| `person-man.glb` | Man (11 animationer) | https://poly.pizza/m/HMnuH5geEG | texturer 512 px |
| `streetlight.glb` | Street Light | https://poly.pizza/m/nFwrlcLvM5 | texturer 512 px, varmt ljus |
| `bench.glb` | Bench | https://poly.pizza/m/jLxjFxFRpw | texturer 512 px |

## CC-BY 3.0 (attribution krävs)

`bicycle.glb` – **Bicycle** av *Poly by Google*, hämtad från
https://poly.pizza/m/b6USSQA731J. Licens: Creative Commons Attribution 3.0
(https://creativecommons.org/licenses/by/3.0/). Modellen är skalad, roterad och
används tillsammans med våra CC0-personer för att bygga cyklisterna i staden.
Attributionen finns även länkad i sidfoten («3D credits»).

## Programvara

`vendor/three.min.js`, `vendor/GLTFLoader.js`, `vendor/SkeletonUtils.js` och
`vendor/BufferGeometryUtils.js` kommer från three.js r128 (MIT-licens, © three.js-
författarna) och serveras lokalt, så 3D-vyn inte är beroende av en CDN. Alla modeller
optimeras med `@gltf-transform/cli` (texturer 512 px, oanvända noder borttagna);
geometrin är i övrigt oförändrad.
