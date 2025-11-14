import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BaseCard from "./BaseCard.vue";

describe("BaseCard", () => {
	describe("Rendering", () => {
		it("should render card element", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.find(".base-card").exists()).toBe(true);
		});

		it("should render default slot content", () => {
			const wrapper = mount(BaseCard, {
				slots: {
					default: "<p>Card content</p>",
				},
			});
			expect(wrapper.html()).toContain("Card content");
		});

		it("should render with custom class", () => {
			const wrapper = mount(BaseCard, {
				attrs: {
					class: "custom-card",
				},
			});
			expect(wrapper.classes()).toContain("custom-card");
		});
	});

	describe("Header Slot", () => {
		it("should render header slot", () => {
			const wrapper = mount(BaseCard, {
				slots: {
					header: "<h2>Card Title</h2>",
				},
			});
			expect(wrapper.find(".base-card__header").exists()).toBe(true);
			expect(wrapper.find(".base-card__header").html()).toContain("Card Title");
		});

		it("should not render header when slot is empty", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.find(".base-card__header").exists()).toBe(false);
		});
	});

	describe("Footer Slot", () => {
		it("should render footer slot", () => {
			const wrapper = mount(BaseCard, {
				slots: {
					footer: "<button>Action</button>",
				},
			});
			expect(wrapper.find(".base-card__footer").exists()).toBe(true);
			expect(wrapper.find(".base-card__footer").html()).toContain("Action");
		});

		it("should not render footer when slot is empty", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.find(".base-card__footer").exists()).toBe(false);
		});
	});

	describe("Padding", () => {
		it("should have default padding", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.classes()).not.toContain("base-card--no-padding");
		});

		it("should remove padding when noPadding is true", () => {
			const wrapper = mount(BaseCard, {
				props: {
					noPadding: true,
				},
			});
			expect(wrapper.classes()).toContain("base-card--no-padding");
		});
	});

	describe("Elevation", () => {
		it("should have default elevation", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.classes()).toContain("base-card--elevation-sm");
		});

		it("should apply no elevation", () => {
			const wrapper = mount(BaseCard, {
				props: {
					elevation: "none",
				},
			});
			expect(wrapper.classes()).toContain("base-card--elevation-none");
		});

		it("should apply medium elevation", () => {
			const wrapper = mount(BaseCard, {
				props: {
					elevation: "md",
				},
			});
			expect(wrapper.classes()).toContain("base-card--elevation-md");
		});

		it("should apply large elevation", () => {
			const wrapper = mount(BaseCard, {
				props: {
					elevation: "lg",
				},
			});
			expect(wrapper.classes()).toContain("base-card--elevation-lg");
		});
	});

	describe("Clickable", () => {
		it("should not be clickable by default", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.classes()).not.toContain("base-card--clickable");
		});

		it("should add clickable class when clickable is true", () => {
			const wrapper = mount(BaseCard, {
				props: {
					clickable: true,
				},
			});
			expect(wrapper.classes()).toContain("base-card--clickable");
		});

		it("should emit click event when clickable", async () => {
			const wrapper = mount(BaseCard, {
				props: {
					clickable: true,
				},
			});
			await wrapper.trigger("click");
			expect(wrapper.emitted("click")).toBeTruthy();
		});

		it("should have cursor pointer when clickable", () => {
			const wrapper = mount(BaseCard, {
				props: {
					clickable: true,
				},
			});
			expect(wrapper.classes()).toContain("base-card--clickable");
		});
	});

	describe("Title and Subtitle Props", () => {
		it("should render title when provided", () => {
			const wrapper = mount(BaseCard, {
				props: {
					title: "Card Title",
				},
			});
			expect(wrapper.find(".base-card__title").exists()).toBe(true);
			expect(wrapper.find(".base-card__title").text()).toBe("Card Title");
		});

		it("should render subtitle when provided", () => {
			const wrapper = mount(BaseCard, {
				props: {
					subtitle: "Card Subtitle",
				},
			});
			expect(wrapper.find(".base-card__subtitle").exists()).toBe(true);
			expect(wrapper.find(".base-card__subtitle").text()).toBe("Card Subtitle");
		});

		it("should render both title and subtitle", () => {
			const wrapper = mount(BaseCard, {
				props: {
					title: "Title",
					subtitle: "Subtitle",
				},
			});
			expect(wrapper.find(".base-card__title").text()).toBe("Title");
			expect(wrapper.find(".base-card__subtitle").text()).toBe("Subtitle");
		});

		it("should prefer header slot over title prop", () => {
			const wrapper = mount(BaseCard, {
				props: {
					title: "Title Prop",
				},
				slots: {
					header: "<h3>Header Slot</h3>",
				},
			});
			expect(wrapper.html()).toContain("Header Slot");
			expect(wrapper.html()).not.toContain("Title Prop");
		});
	});

	describe("Bordered", () => {
		it("should not have border by default", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.classes()).not.toContain("base-card--bordered");
		});

		it("should add border when bordered is true", () => {
			const wrapper = mount(BaseCard, {
				props: {
					bordered: true,
				},
			});
			expect(wrapper.classes()).toContain("base-card--bordered");
		});
	});

	describe("Accessibility", () => {
		it("should be a div by default", () => {
			const wrapper = mount(BaseCard);
			expect(wrapper.element.tagName).toBe("DIV");
		});

		it("should accept aria attributes", () => {
			const wrapper = mount(BaseCard, {
				attrs: {
					"aria-label": "Product card",
				},
			});
			expect(wrapper.attributes("aria-label")).toBe("Product card");
		});

		it('should have role="button" when clickable', () => {
			const wrapper = mount(BaseCard, {
				props: {
					clickable: true,
				},
			});
			expect(wrapper.attributes("role")).toBe("button");
		});

		it("should have tabindex when clickable", () => {
			const wrapper = mount(BaseCard, {
				props: {
					clickable: true,
				},
			});
			expect(wrapper.attributes("tabindex")).toBe("0");
		});

		it("should emit click on Enter key when clickable", async () => {
			const wrapper = mount(BaseCard, {
				props: {
					clickable: true,
				},
			});
			await wrapper.trigger("keydown", { key: "Enter" });
			expect(wrapper.emitted("click")).toBeTruthy();
		});

		it("should emit click on Space key when clickable", async () => {
			const wrapper = mount(BaseCard, {
				props: {
					clickable: true,
				},
			});
			await wrapper.trigger("keydown", { key: " " });
			expect(wrapper.emitted("click")).toBeTruthy();
		});
	});
});
