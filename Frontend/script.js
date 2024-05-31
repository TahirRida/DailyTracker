const api_gateway =
  "https://yjvfn615c0.execute-api.us-east-1.amazonaws.com/test";

async function addTodo() {
  const inputElement = document.getElementById("new-todo");
  const todoName = inputElement.value.trim();

  if (!todoName) {
    alert("Please enter a valid ToDo item.");
    return;
  }

  const apiUrl = `${api_gateway}/todos`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: todoName }),
    });

    const data = await response.json();
    alert(data.message); // Display success or error message
    inputElement.value = ""; // Clear input field
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
  showAllTodos();
}

async function getTodo() {
  const idElement = document.getElementById("todo-id");
  const todoId = idElement.value.trim();

  if (!todoId) {
    alert("Please enter a valid ToDo ID.");
    return;
  }

  const apiUrl = `${api_gateway}/getTodo?id=${todoId}`; // Include 'id' in the URL

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const todoIdValue = data.id.N;
    const todoNameValue = data.name.S;
    const todoDescriptionValue = data.description.S; // Assuming 'description' is returned as a string
    const todoStatusValue = data.status.S; // Assuming 'status' is returned as a string

    document.getElementById("todo-id-display").textContent = todoIdValue;
    document.getElementById("todo-name-display").textContent = todoNameValue;
    document.getElementById("todo-description-display").textContent =
      todoDescriptionValue;
    document.getElementById("todo-status-display").textContent =
      todoStatusValue;

    // Set the text of the update status button based on current status
    const statusButton = document.getElementById("update-status-button");
    statusButton.textContent =
      todoStatusValue === "completed" ? "Uncomplete" : "Complete";
    statusButton.classList.remove("hidden"); // Show the button

    // Optionally handle the response data
    if (response.ok) {
      const todoItem = data.item; // Assuming the response has an 'item' field

      // Create update buttons for the displayed item
      createUpdateButtons(
        todoId,
        todoNameValue,
        todoDescriptionValue,
        todoStatusValue
      );
    } else {
      // Handle error response
      console.error("Error:", data.error);
    }

    idElement.value = ""; // Clear input after request
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

async function showAllTodos() {
  const todoTable = document.getElementById("todo-list");

  try {
    const response = await fetch(`${api_gateway}/getall`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Clear existing table rows
      todoTable.innerHTML = "";

      // Create table rows for each ToDo item
      data.forEach((todo) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${todo.id.N}</td>
          <td>${todo.name.S}</td>
          <td>${todo.description.S}</td>
          <td>${todo.status.S}</td>
          <td><button class="delete-button" onclick="deleteTodo(${todo.id.N})">Delete</button></td>
        `;
        todoTable.appendChild(row);
      });
    } else {
      console.error("Error:", data.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`${api_gateway}/deletetodo?id=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Todo deleted successfully.");
      showAllTodos();
    } else {
      const errorData = await response.json();
      console.error("Delete failed:", errorData);
      alert("Delete failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

async function updateName(id, newName, description) {
  try {
    const response = await fetch(`${api_gateway}/updatetodo?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName, description: description }),
    });

    const data = await response.json();
    if (response.ok) {
      // Update the displayed name immediately
      document.getElementById("todo-name-display").textContent = newName;
      // Recreate update buttons
      createUpdateButtons(id, newName, description);
      showAllTodos();
    } else {
      alert("Update failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

async function updateDescription(id, newDescription, name) {
  try {
    const response = await fetch(`${api_gateway}/updatetodo?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name, description: newDescription }),
    });

    const data = await response.json();
    if (response.ok) {
      // Update the displayed description immediately
      document.getElementById("todo-description-display").textContent =
        newDescription;
      // Recreate update buttons
      createUpdateButtons(id, name, newDescription);
      showAllTodos();
    } else {
      alert("Update failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

async function updateStatus() {
  const todoId = document.getElementById("todo-id-display").textContent.trim();
  const currentStatus = document
    .getElementById("todo-status-display")
    .textContent.trim();
  const todoName = document
    .getElementById("todo-name-display")
    .textContent.trim();
  const todoDescription = document
    .getElementById("todo-description-display")
    .textContent.trim();

  if (!todoId) {
    alert("No ToDo ID found to update the status.");
    return;
  }

  const newStatus = currentStatus === "completed" ? "uncompleted" : "completed";

  try {
    const response = await fetch(`${api_gateway}/updatetodo?id=${todoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: todoName,
        description: todoDescription,
        status: newStatus,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      document.getElementById("todo-status-display").textContent =
        responseData.status.S;
      document.getElementById("update-status-button").textContent =
        responseData.status.S === "completed" ? "Uncomplete" : "Complete";
      showAllTodos();
    } else {
      const errorData = await response.json();
      console.error("Status update failed:", errorData);
      alert("Status update failed. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

function createUpdateButtons(
  todoId,
  todoNameValue,
  todoDescriptionValue,
  todoStatusValue
) {
  // Remove existing update buttons
  document
    .querySelectorAll(".update-button")
    .forEach((button) => button.remove());

  // Create update name button
  const updateNameButton = document.createElement("button");
  updateNameButton.textContent = "Update Name";
  updateNameButton.className = "update-button";
  updateNameButton.onclick = () => {
    const newName = prompt("Enter new name:");
    if (newName) {
      updateName(todoId, newName, todoDescriptionValue);
    }
  };
  document.getElementById("todo-name").appendChild(updateNameButton);

  // Create update description button
  const updateDescButton = document.createElement("button");
  updateDescButton.textContent = "Update Description";
  updateDescButton.className = "update-button";
  updateDescButton.onclick = () => {
    const newDesc = prompt("Enter new description:");
    if (newDesc) {
      updateDescription(todoId, newDesc, todoNameValue);
    }
  };
  document.getElementById("todo-description").appendChild(updateDescButton);

  // Check if status update button exists, if not, create it
  let statusUpdateButton = document.getElementById("update-status-button");
  if (!statusUpdateButton) {
    statusUpdateButton = document.createElement("button");
    statusUpdateButton.id = "update-status-button";
    statusUpdateButton.className = "update-button";
    statusUpdateButton.onclick = () => {
      updateStatus();
    };
    document
      .getElementById("todo-status-display")
      .appendChild(statusUpdateButton);
  }

  // Set text of status update button based on current status
  statusUpdateButton.textContent =
    todoStatusValue === "completed" ? "Uncomplete" : "Complete";
}

function hideAllTodos() {
  const todoListElement = document.getElementById("todo-list");
  todoListElement.innerHTML = "";
}
