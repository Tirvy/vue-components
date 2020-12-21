function handlePaste(event, binding) {
  let data = event.clipboardData.getData("text");
  if (data.indexOf("\t") >= 0 || data.indexOf("\n") >= 0) {
    event.preventDefault();
    let rows = data.split("\n").map(function(row) {
      return row.split("\t");
    });

    let last_row = rows[rows.length - 1];
    if (last_row.length === 1 && last_row[0] === '') {
      rows.pop();
    }

    if (binding.value) {
      binding.value.func(rows, binding.value.params);
    }
  }
}

/*
* A directive to handle pasted text
*
* */

export default {
  inserted(el, binding) {
    el.addEventListener("paste", () => handlePaste(event, binding));
  },
  unbind(el, binding){
    el.removeEventListener("paste", () => handlePaste(event, binding));
  }
};
