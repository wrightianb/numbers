let data;
let factors;
let factorIndex;
let nodes;
let number;
let svg;

const getFactorPairs = () => Object.keys(data[number.toString()]);
const percent = decimal => `${Math.floor(decimal * 100)}%`;
const range = n => [...Array(n).keys()];

const [
  numberSpan,
  incrementButton,
  decrementButton,
  nextButton,
  previousButton,
  factorsSpan,
] = [
  "number",
  "increment",
  "decrement",
  "next",
  "previous",
  "factors",
].map(id => document.querySelector(`#${id}`));

function initialize(update, render) {
  factorIndex = 0;
  number = 1;
  svg = d3.select("svg");

  update();

  const increment = () => number < 100 && number++;
  const decrement = () => number > 1 && number--;
  const next = () => factorIndex < getFactorPairs().length - 1 && factorIndex++;
  const previous = () => factorIndex > 0 && factorIndex--;

  const react = operate => {
    operate();
    update();
    render();
  };

  [
    [incrementButton, increment],
    [decrementButton, decrement],
    [nextButton, next],
    [previousButton, previous],
  ].forEach(([button, operation]) =>
    button.addEventListener("click", () => react(operation))
  );

  document.addEventListener("keydown", ({ code }) => {
    if (code === "ArrowRight") {
      nextButton.click();
    } else if (code === "ArrowLeft") {
      previousButton.click();
    } else if (code === "ArrowUp") {
      react(increment);
    } else if (code === "ArrowDown") {
      react(decrement);
    }
  });

  render();
}

function update() {
  const factorPairs = getFactorPairs();

  if (factorIndex > factorPairs.length - 1) {
    factorIndex = factorPairs.length - 1;
  }
  factors = factorPairs[factorIndex];
  nodes = data[number.toString()][factors];
}

function render() {
  if (number < 2) {
    decrementButton.setAttribute("disabled", true);
  } else {
    decrementButton.removeAttribute("disabled");
  }

  if (factorIndex < getFactorPairs().length - 1) {
    nextButton.removeAttribute("disabled");
  } else {
    nextButton.setAttribute("disabled", true);
  }

  if (factors.length && factorIndex > 0) {
    previousButton.removeAttribute("disabled");
  } else {
    previousButton.setAttribute("disabled", true);
  }

  numberSpan.innerText = number;
  factorsSpan.innerText = factors;

  const t = svg.transition().duration(750);

  const scale = (Math.floor(number / 10) + 1) * 10;
  svg.transition(t).attr("viewBox", _ => `0 0 ${scale} ${scale}`);

  svg
    .selectAll("rect")
    .data(nodes, d => d.position)
    .join(
      enter =>
        enter
          .append("rect")
          .attr("y", _ => 0)
          .attr("x", _ => 0)
          .call(enter =>
            enter
              .transition(t)
              .attr("y", data => data.column)
              .attr("x", data => data.row)
          ),
      update =>
        update.call(update =>
          update
            .transition(t)
            .attr("y", data => data.column)
            .attr("x", data => data.row)
        ),
      exit =>
        exit.call(exit =>
          exit
            .transition(t)
            .attr("y", _ => 0)
            .attr("x", _ => 0)
            .remove()
        )
    )
    .attr("fill", "black")
    .attr("height", _ => "1%")
    .attr("width", _ => "1%");
}

fetch("data.json")
  .then(response => response.json())
  .then(responseData => {
    data = responseData;
    initialize(update, render);
  });
