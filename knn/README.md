# K-Nearest Neighbors: From Distance to Prediction

An interactive **KNN classification** demo for students meeting K-nearest neighbors for the first time. Plain HTML, CSS and JavaScript, with no libraries.

## Running it

Open `index.html` in any modern browser. No server, build step, package installation or internet connection is needed. Keep the four files together in one folder:

- `index.html` – page structure and text
- `styles.css` – layout, colors and focus styles
- `app.js` – data generation, KNN logic, drawing and interaction
- `README.md` – this file

## Dataset presets

| Preset | Axes | Classes | What it shows |
|---|---|---|---|
| **Student Support** (default) | Study hours, Sleep hours | Submitted assignment / Did not submit | Two overlapping groups; nearby cases are evidence, not certainty |
| **Twin Moons** | Synthetic feature 1, 2 | Class A / Class B | KNN follows a curved boundary without fitting a line |
| **Overlapping Clusters** | Synthetic feature 1, 2 | Class A / Class B | Clear groups overall, ambiguous in the middle |
| **Concentric Rings** | Synthetic feature 1, 2 | Class A (inner) / Class B (outer) | Classes no single straight line can separate |

Each preset produces roughly 45–55 training cases.

## Controls

- **Dataset** – choose a preset. This resets to Sample 1 and moves the test case to its default spot.
- **New Sample** – draws the next reproducible sample of the same pattern (Sample 2, 3, …).
- **Reset Sample** – returns to Sample 1.
- **Number of neighbors, K** – odd values from 1 to 15 (only values up to the number of training cases are listed). Default is 3.
- **View** – *Neighbors* (default) highlights the voting cases; *Prediction Map* also shades the background by the class KNN would predict at each location.
- **Follow cursor** – when on, the test case follows the mouse. Clicking the plot freezes it; clicking elsewhere moves the frozen test case.
- **Teaching Options** (collapsed by default) – neighborhood circle, neighbor lines (drawn when K ≤ 5), point IDs, coordinate readout, follow/freeze, and reset the test case.
- **What to notice** – short prompts for discussion.

### Pointer, touch and keyboard

- **Mouse:** move to preview; click to freeze.
- **Touch or pen:** drag to position the test case; lifting your finger freezes it.
- **Keyboard:** Tab to the plot, then use the arrow keys to move the test case by 1% of the axis range. Hold **Shift** for 5% steps. All other controls are standard buttons, selects and checkboxes.

A screen-reader live region announces the votes and prediction when the test case is frozen or moved by keyboard, when K changes, and when the data changes.

## How seeded sample generation works

`app.js` includes a small pseudorandom number generator (mulberry32) plus a Gaussian sampler. The seed for a sample is derived from the preset's name and the sample number, so **the same preset and sample number always produce exactly the same points** on every computer.

Every sample is checked before it is shown:

- both classes are present, and each has at least 30% of the cases;
- the two classes overlap or come close somewhere;
- no two training cases have identical coordinates;
- the default test position lies inside the plot.

If a draw fails a check, the generator tries the next attempt seed, which is also derived deterministically, so results stay reproducible.

Training cases are numbered 1, 2, 3, … from left to right. These are the stable point IDs shown when **Show point IDs** is on.

## Colors and shapes

| Meaning | Encoding |
|---|---|
| Class A / Submitted assignment | Blue circle |
| Class B / Did not submit | Orange square |
| Test instance / New student | Large star with a heavy dark outline; its interior takes the predicted class color |
| Not one of the K nearest | Light gray (shape kept) |

The palette is the color-blind-safe Okabe–Ito blue and orange. Shape and text always carry the same information as color, so the demo never relies on color alone. The page follows the system light or dark setting.

## How KNN is computed

For the test case, the demo computes the Euclidean distance to every training case in the displayed two-feature units, sorts from nearest to farthest, keeps the first K, counts their labels, and predicts the majority. The dashed neighborhood circle's radius equals the distance to the Kth-nearest case. The displayed coordinates are rounded to one decimal place, but distances use the unrounded values.

The Prediction Map repeats the same calculation on a fine grid. It is recalculated only when the dataset, the sample, K or the canvas size changes, not when the cursor moves.

## Distance-tie rule

Odd K prevents a tied vote between two classes. Two training cases can still be exactly the same distance from the test case. When that happens, the case with the **smaller point ID** is ranked first. The prediction map uses the same rule, so results are fully deterministic.
