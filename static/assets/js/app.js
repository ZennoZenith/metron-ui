const data = {
  problemStatement:
    `If a **ball** is thrown *vertically upwards* with a ~velocity~ of *{{ $$velocity }}* m/s, then velocity of the ball after {{ $$time }} seconds is:
<br />
_(g = 10 m/s^2)_`,
  hint: "",
  questionType: "MCQ",
  varients: [
    {
      variables: [
        {
          name: "velocity",
          value: "40",
        },
        {
          name: "time",
          value: "two",
        },
        {
          name: "someVariableUsedInExplanation1",
          value: "10",
        },
        {
          name: "someVariableUsedInExplanation2",
          value: "20",
        },
      ],
      correctAnswers: [
        {
          answer: "15 m/s",
          explanation: "Some short explanation here",
        },
      ],
      incorrectAnswers: [
        {
          answer: "20 m/s",
          explanation: "",
        },
        {
          answer: "25 m/s",
        },
        {
          answer: "28 m/s",
        },
      ],
    },
  ],
  explanation: "Some long explanation containing variables {{ $$someVariableUsedInExplanation1 }}",
};

const imagePreviewElement = document.querySelector(
  "#preview-selected-image",
);
const imageInputElement = document.querySelector(
  "#image",
);

function previewImage(event) {
  const imageFiles = event.target.files;
  if (null === imagePreviewElement) {
    console.error("Image preview element is null");
    return;
  }

  const parent = imagePreviewElement.parentElement;
  if (parent === null) {
    console.error("Image preview element's parent is null");
    return;
  }

  const imageFilesLength = imageFiles.length;
  if (imageFilesLength > 0) {
    const imageSrc = URL.createObjectURL(imageFiles[0]);
    imagePreviewElement.src = imageSrc;
    parent.classList.remove("skeleton");
  } else {
    imagePreviewElement.removeAttribute("src");
    imageInputElement.value = "";
    parent.classList.add("skeleton");
  }
}

function removeImage(_event) {
  if (null === imagePreviewElement) {
    console.error("Image preview element is null");
    return;
  }

  const parent = imagePreviewElement.parentElement;
  if (parent === null) {
    console.error("Image preview element's parent is null");
    return;
  }

  imagePreviewElement.removeAttribute("src");
  imageInputElement.value = "";
  parent.classList.add("skeleton");
}

document.body.addEventListener("htmx:beforeSwap", function(evt) {
  if (evt.detail.xhr.status === 404) {
    // alert the user when a 404 occurs (maybe use a nicer mechanism than alert())
    // alert("Error: Could Not Find Resource");
  } else if (evt.detail.xhr.status === 422) {
    // allow 422 responses to swap as we are using this as a signal that
    // a form was submitted with bad data and want to rerender with the
    // errors
    //
    // set isError to false to avoid error logging in console
    evt.detail.shouldSwap = true;
    evt.detail.isError = false;
  } else if (evt.detail.xhr.status === 418) {
    // if the response code 418 (I'm a teapot) is returned, retarget the
    // content of the response to the element with the id `teapot`
    evt.detail.shouldSwap = true;
    evt.detail.target = htmx.find("#teapot");
  }
});
