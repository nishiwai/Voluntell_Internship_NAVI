// よくある質問：1つ開いたら、ほかの質問は自動で閉じる
const faqs = document.querySelectorAll(".faq");

faqs.forEach(function (faq) {
  faq.addEventListener("toggle", function () {
    if (faq.open) {
      faqs.forEach(function (other) {
        if (other !== faq) other.open = false;
      });
    }
  });
});
