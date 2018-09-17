import HomeStore from "./HomeStore";
import data from "../../container/HomeContainer/data.json";

describe("HomeStore", () => {
	it("should handle FETCH_LIST_SUCCESS", () => {
		const store = new HomeStore();
		store.fetchItems(data);
		const expectedArray = [
      {
        "route": "Overview",
        "caption": "Overview"
      },
      {
        "route": "BlankPage",
        "caption": "VMs"
      },
      {
        "route": "BlankPage",
        "caption": "Hosts"
      },
      {
        "route": "BlankPage",
        "caption": "Stoarages"
      },
      {
        "route": "BlankPage",
        "caption": "Networks"
      }
    ];
		var actualJSON = JSON.stringify(store.items);
		var expectedJSON = JSON.stringify(expectedArray);
		expect(expectedJSON).toEqual(actualJSON);
	});
});
