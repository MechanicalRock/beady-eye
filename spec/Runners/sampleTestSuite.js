module.exports.suite = (params) => {
  describe("sample describe 1", () => {
    it("sample test 11", () => {
      expect(1).toEqual(2);
    });
    it("sample test 12", () => {
      expect(1).toEqual(1);
    });
  });
  describe("sample describe 2", () => {
    it("sample test 21", () => {
      expect(2).toEqual(3);
    });
  });
};
