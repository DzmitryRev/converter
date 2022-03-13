import "./styles/style.css";

type CurrenciesT = {
  Cur_Abbreviation: string;
  Cur_OfficialRate: number;
};

interface ConverterI {
  root: string;
  inputSelect: HTMLSelectElement;
  results: HTMLDivElement;
  input: HTMLInputElement;
  currencies: CurrenciesT[];
  // get data from nbrb api
  fetchCurrencies: (currencies: string[]) => void;
  // commit changes after fetching data
  commit: () => void;
  //
  calculate: () => void;
  setupEventListeners: () => void;
  // run app
  mount: () => void;
}

class Converter implements ConverterI {
  root: string;
  inputSelect: HTMLSelectElement;
  results: HTMLDivElement;
  input: HTMLInputElement;
  currencies: CurrenciesT[];

  constructor(currencies: string[], root: string) {
    this.root = root;
    this.inputSelect = document.createElement("select");
    this.results = document.createElement("div");
    this.results.classList.add("resultSide");
    this.input = document.createElement("input");
    this.input.type = "number";

    this.fetchCurrencies(currencies);
  }

  async fetchCurrencies(currencies: string[]) {
    try {
      this.results.innerText = "Loading...";
      let request = await fetch("https://www.nbrb.by/API/ExRates/Rates?Periodicity=0");
      let response = await request.json();
      let coincidences: CurrenciesT[] = [];

      response.forEach((item: any) => {
        if (currencies.includes(item.Cur_Abbreviation)) {
          coincidences.push({
            Cur_Abbreviation: item.Cur_Abbreviation,
            Cur_OfficialRate: item.Cur_OfficialRate / item.Cur_Scale,
          });
        }
      });
      coincidences.push({
        Cur_Abbreviation: "BYN",
        Cur_OfficialRate: 1,
      });
      this.currencies = coincidences;
      this.commit();
      this.calculate();
    } catch {
      this.results.innerHTML = "Error";
    }
  }
  commit() {
    this.inputSelect.innerHTML = "";
    this.results.innerHTML = "";

    this.currencies.forEach((item) => {
      const option = document.createElement("option");
      option.innerHTML = item.Cur_Abbreviation;
      option.value = item.Cur_Abbreviation;
      this.inputSelect.insertAdjacentElement("beforeend", option);
      const resultDiv = document.createElement("div");
      resultDiv.innerHTML = item.Cur_Abbreviation;
      resultDiv.setAttribute("currency", item.Cur_Abbreviation);
      resultDiv.setAttribute("value", String(item.Cur_OfficialRate));
      this.results.insertAdjacentElement("beforeend", resultDiv);
    });
  }
  calculate() {
    let z: number = 0;
    Array.from(this.results.children).forEach((item: HTMLElement, index, arr) => {
      if (this.inputSelect.value === item.getAttribute("currency")) {
        item.classList.add("hidden");
      } else {
        item.classList.remove("hidden");
      }
      if (this.inputSelect.value !== "BYN") {
        let selectedValue: number;
        arr.forEach((item) => {
          if (item.getAttribute("currency") === this.inputSelect.value) {
            selectedValue = Number(item.getAttribute("value"));
          }
        });
        z = Number(this.input.value) * selectedValue;
        let aa = Number(item.getAttribute("value"));
        let res = (z / aa).toFixed(2);

        if (isNaN(Number(res))) {
          item.innerText = `${item.getAttribute("currency")}: ${res}`;
          return;
        }
        item.innerText = `${item.getAttribute("currency")}: ${res}`;
      } else {
        let res = (Number(this.input.value) / Number(item.getAttribute("value"))).toFixed(2);
        item.innerText = `${item.getAttribute("currency")}: ${res}`;
      }
    });
  }
  setupEventListeners() {
    this.input.addEventListener("input", () => {
      this.calculate();
    });
    this.inputSelect.addEventListener("change", () => {
      this.calculate();
    });
  }
  mount() {
    // find root element
    const rootElement = document.querySelector(this.root);
    // availability check
    if (!rootElement) {
      throw new Error("root element is not defined");
    }
    // init event listeners
    this.setupEventListeners();
    // mount elements
    const inputSide = document.createElement("div");
    inputSide.classList.add("inputSide");
    inputSide.insertAdjacentElement("beforeend", this.input);
    inputSide.insertAdjacentElement("beforeend", this.inputSelect);
    // mounting all in root element
    rootElement.insertAdjacentElement("beforeend", inputSide);
    rootElement.insertAdjacentElement("beforeend", this.results);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const converter = new Converter(["USD", "EUR", "RUB"], "#root");
  converter.mount();
  //   const converter2 = new Converter(["CHY", "RUB", "AMD"], "#root2");
  //   converter2.mount();
  //   const converter3 = new Converter(["aaas", "asdq", "AMD", "BGN", "CHY"], "#root3");
  //   converter3.mount();
});
