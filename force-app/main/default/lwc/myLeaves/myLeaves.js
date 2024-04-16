import { LightningElement, wire } from 'lwc';
import getMyLeaves from '@salesforce/apex/LeaveRequstController.getMyLeaves';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
const COLUMNS = [

    {label: 'Request Id', fieldName: 'Name', cellAttributes: {class:{fieldName:'cellClass'}}},
    {label: 'From Date', fieldName: 'From_Date__c', cellAttributes: {class:{fieldName:'cellClass'}}},
    {label: 'To Date', fieldName: 'To_Date__c', cellAttributes: {class:{fieldName:'cellClass'}}},
    {label: 'Reason', fieldName: 'Reason__c', cellAttributes: {class:{fieldName:'cellClass'}}},
    {label: 'Status', fieldName: 'Status__c', cellAttributes: {class:{fieldName:'cellClass'}}},
    {label: 'Manager Comment', fieldName: 'Manager_Comment__c', cellAttributes: {class:{fieldName:'cellClass'}}},
    {type:"button", typeAttributes: {

        label: 'Edit',
        name: 'Edit',
        title: 'Edit',
        value: 'edit',
        disabled: {fieldName: 'isEditDisabled'}
        
        }, cellAttributes: {class:{fieldName:'cellClass'}}
    }

]
export default class MyLeaves extends LightningElement {

    columns=COLUMNS;
    MyLeaves = [];
    showModalPopup = false;
    myLeavesWireResult;
    objectApiName = 'LeaveRequest__c';
    recordId = '';
    currentUserId = Id;

    @wire(getMyLeaves)

    wiredMyLeaves(result){
        this.myLeavesWireResult=result;

        if(result.data){
            this.myLeaves = result.data.map(a => ({
                ...a,
                cellClass: a.Status__c == 'Approved' ? 'slds-theme_success' : a.Status__c == 'Rejected' ? 'slds-theme_warning' : '',
                isEditDisabled: a.Status__c != 'Pending'
            }));
            
        }

        if(result.error) {

            console.log('error occured while fetching my leaves -', result.error);
        }
    }
    newRequestClickHandler(){

        this.showModalPopup = true;
        this.recordId = '';
    
     }
 popupCloseHandler(){
    this.showModalPopup= false;
 }

 rowActionHandler(event){
    this.showModalPopul=true;
    this.recordId = event.details.row.Id;

 }

 successHandler(event)
 {
    this.showModalPopup=false;
    this.showToast('Data saved successfully');
    setTimeout(() => {
        refreshApex(this.myLeavesWireResult);
    }, 1000); // 1 second timeout
 }
 submitHandler(event){
    event.preventDefault(); // Prevent default form submission
    //form submission logic
    const fields = {...event.detail.fields};
    if (new Date(fields.From_Date__c)> new Date(fields.To_Date__c)){

        this.showToast('From date should not be greater than to date', 'Error', 'error')
    }
    else if(new Date() > new Date(fields.From_Date__c)){
        this.showToast('From date should not be less than today', 'Error', 'error')
    }
    else{
        this.refs.leaveRequestForm.submit(fields);
    }
 }

 showToast(message, title = 'success', variant = 'success'){

    const event = new ShowToastEvent({

        title, message, variant
    });

    this.dispatchEvent(event);
 }

}