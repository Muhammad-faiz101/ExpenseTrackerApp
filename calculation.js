   
document.addEventListener("DOMContentLoaded",()=>{
     let amount_remaining=0;
    let amount_spent=0;
    let total_budget=0;
     //object creation to store data
    let expense_list={};
    //object have lists as values for keys 
    expense_list.id=[];
    expense_list.description=[];
    expense_list.amount=[];
    expense_list.category=[];
    //for id of expense 
    let counter=0;
  
    const savedData=JSON.parse(localStorage.getItem("expenseTrackerData"));
    if(savedData && savedData.expense_list&& savedData.expense_list.id)
    {
        expense_list=savedData.expense_list ;
        counter=savedData.counter ||0;
        total_budget = savedData.total_budget || 0;

        amount_spent = expense_list.amount.reduce((sum, value) => sum + parseInt(value), 0);
        amount_remaining=total_budget-amount_spent;

        // set the values of spent and remaining amount
        document.querySelector("#spent_amount").innerHTML=amount_spent;
        document.querySelector("#remaining_amount").innerHTML=amount_remaining;
        document.querySelector("#total_budget").innerHTML=total_budget;

        //recreating all expense cards
        for(let i=0;i<expense_list.id.length;i++)
        {
            const expenseCardHtml=`
            <div class="col" data-id="${expense_list.id[i]}">
                        <div class="card shadow-sm fade-card" ">
                            <div class="card-body">
                                <h5   class="card-title">${expense_list.description[i]}</h5>
                                <p  class="card-text">Amount: Rs.${expense_list.amount[i]}</p>
                                <span  class="badge bg-primary badge-custom badge-custom">${expense_list.category[i]}</span>
                                <button class="btn btn-sm btn-danger float-end" data-bs-toggle="modal" data-bs-target="#expensecard-edit-modal">Edit</button>
                            </div>
                            
                        </div>
            </div>
            
            
            `;
            document.querySelector("#expense_list_items").insertAdjacentHTML("beforeend",expenseCardHtml);
        }
        console.log("Data loaded from storage ",savedData);


    }
    else
    {
        console.log("No valid saved data found -initializing empty lists.")
    }


    // function to store data to local storage 
    function saveData()
    {
        total_budget=amount_spent+amount_remaining;
        const data={expense_list,amount_remaining,amount_spent,counter,total_budget};
        localStorage.setItem("expenseTrackerData",JSON.stringify(data));
    }

    // getting budget from user and displaying
 
    function setBudget(event)
    {
        
        let total_budget=parseInt(document.querySelector("#budget_field").value);

        document.querySelector("#total_budget").innerHTML=total_budget;
        amount_remaining=total_budget-amount_spent;

        document.querySelector("#remaining_amount").innerHTML=amount_remaining;
        document.querySelector("#spent_amount").innerHTML=amount_spent;

        saveData();
        budgetForm.reset();
        budgetForm.classList.remove("was-validated");

     } //  })
    
   

    function addCard(e)
    {
        e.preventDefault();
        // Declaring varibale to store user entered values
        let description=document.querySelector("#description").value;
        let amount=parseInt(document.querySelector("#amount").value);
        let category=document.querySelector("#category").value;

        //counter for id of card
        counter++;

        //adding each card values to object's lists
        expense_list.id.push(counter);
        expense_list.description.push(description);
        expense_list.amount.push(parseInt(amount));
        expense_list.category.push(category);
        
        //update spent amount & remaining
        if (amount_remaining>=amount)
           {
            amount_spent+=amount;
            amount_remaining-=amount;

            //updating html's elements
            document.querySelector("#spent_amount").innerHTML=parseInt(amount_spent);
            document.querySelector("#remaining_amount").innerHTML=parseInt(amount_remaining);

             let cardCreateCode=`
            <div class="col" data-id="${counter}">
                        <div class="card shadow-sm fade-card" ">
                            <div class="card-body">
                                <h5   class="card-title">${description}</h5>
                                <p  class="card-text">Amount: Rs.${amount}</p>
                                <span  class="badge bg-primary badge-custom badge-custom">${category}</span>
                                <button class="btn btn-sm btn-danger float-end" data-bs-toggle="modal" data-bs-target="#expensecard-edit-modal">Edit</button>
                            </div>
                            
                        </div>
            `;
            let expense_list_div=document.querySelector("#expense_list_items");
            expense_list_div.insertAdjacentHTML("beforeend",cardCreateCode);
            console.log(expense_list);
            saveData();
            
            
           }
        else
        {
            
        budgetAlert();
        
        }
    }
// showing modal containg unsufficient budget message
    function budgetAlert()
    {
        document.querySelector("#budget-alert-modal").style.display="block";
            document.addEventListener("click",(event)=>{
                if(event.target.matches("#close_modal_budget_footer,#close_modal_budget_header"))
                {
                     document.querySelector("#budget-alert-modal").style.display="none";
                }
            });
    }

    // bootstrap validation for total budget
    let budgetForm=document.querySelector("#budgetForm");
    budgetForm.addEventListener("submit",(e)=>{
        e.preventDefault();
        if(!budgetForm.checkValidity())
        {
           budgetForm.classList.add("was-validated");
           return;
        }
          setBudget(e);
        
    
    });

    //Bootstrap validation for add expense form
    let expenseForm=document.querySelector("#expense_form");
    expenseForm.addEventListener("submit",(e)=>{
        e.preventDefault();
        if(!expenseForm.checkValidity())
        {
           expenseForm.classList.add("was-validated");
           return;
        }
        
    
          addCard(e);
        expenseForm.reset()
        expenseForm.classList.remove("was-validated");
    
    });

    // Bootstrap validation for edit expense modal 
    let editModalForm=document.querySelector("#edit_modal-form");
    editModalForm.addEventListener("submit",(e)=>{
        e.preventDefault();
        if(!editModalForm.checkValidity())
        {
           editModalForm.classList.add("was-validated");
           return;
        }
            
         editExpenseCard(e);
        editModalForm.reset()
        editModalForm.classList.remove("was-validated");
    
    });


 
    let modal=document.querySelector("#expensecard-edit-modal");
    //modal instance 
    let editModal = new bootstrap.Modal(modal);
    // opening the modal and setting the values to modal
    document.querySelector("#expense_list_items").addEventListener("click",(e)=>{
        if(e.target.classList.contains("btn-danger"))
        {
            let cardCol=e.target.closest(".col");
            let Id=cardCol.getAttribute("data-id");

            
            document.querySelector("#expensecard-edit-modal").setAttribute("data-editing-id",Id);

            let Index=expense_list.id.indexOf(parseInt(Id));
            document.querySelector("#description_edited").value=expense_list.description[Index];
            document.querySelector("#amount_edited").value=expense_list.amount[Index];
            document.querySelector("#category_edited").value=expense_list.category[Index];

            editModal.show();

        }
    });


// function for updating the expense card and expense_list object 
     function editExpenseCard(Event)
         {
           let edited_description=document.querySelector("#description_edited").value;
           let  edited_amount=parseInt(document.querySelector("#amount_edited").value);
            let edited_category=document.querySelector("#category_edited").value;
            
            let modal1=document.querySelector("#expensecard-edit-modal");
            const editingId=parseInt(modal1.getAttribute("data-editing-id"));

            const Index1=expense_list.id.indexOf(editingId);

            if(Index1!==-1)
            {
                const oldamount=expense_list.amount[Index1];
                const netchange=edited_amount-oldamount;
                    
                if (amount_remaining>=netchange)
                   {
                    amount_remaining-=netchange;
                    amount_spent+=netchange;

                    expense_list.description[Index1]=edited_description;
                    expense_list.amount[Index1]=edited_amount;
                    expense_list.category[Index1]=edited_category;

                    const cardCol = document.querySelector(`[data-id="${editingId}"]`);

                    cardCol.querySelector(".card-title").textContent=edited_description;
                    cardCol.querySelector(".card-text").textContent=`Amount: Rs.${edited_amount}`;
                    cardCol.querySelector(".badge").textContent=edited_category;
                    
                    
                    
                    //updating html's elements
                    document.querySelector("#spent_amount").innerHTML=parseInt(amount_spent);
                    document.querySelector("#remaining_amount").innerHTML=parseInt(amount_remaining);

                    saveData();
                    editModal.hide();
                    console.log("updated expense list ",expense_list);
                    }
                else
                    {
                        Event.preventDefault();
                        
                        // show alert inside modal if insufficient budget
                        const alertContainer = document.querySelector("#budgetAlertEditModal");
                        alertContainer.innerHTML = `
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                Insufficient Budget!
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        `;
                        
                        // Auto-remove alert after 3 seconds without using Bootstrap's close method
                        setTimeout(() => {
                            const currentAlert = alertContainer.querySelector('.alert');
                            if (currentAlert) {
                                currentAlert.remove();
                            }
                        }, 3000);
                    }
            }
        else
        {
            console.error("Error : id not founnd in expense list");
        }

    }

   let resetbtn= document.querySelector("#resetBtn");
    resetbtn.addEventListener("click",()=>{

        localStorage.removeItem("expenseTrackerData");
        location.reload();

    });
});




