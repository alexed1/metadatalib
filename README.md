# Metadata Service
The Metadata Service allows you to load metadata items available in the Salesforce org given that the your user has all necessary permissions.

## Installation

Currently, the manager represents just a set of files, so in order to add it to your Salesforce application you need just to copy the files to your application directory. The files that actually contain the functionality are `aura\metadataService\*` and `classes\Metadata\*`.

## Usage

The main access point to the metadata functionality is a Lightning component `metadataService`. All you need to do is just add it to one of your component's markup. You need just one component for the whole application or if you like it more, you can add it to all components separately. Since the `metadataService` has no user interface you can add it to any part of your component. 

### getMetadataItemListAsync

This method asynchronously retrieves the list of metadata items of the specified type. The full list of available types can be found [here](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_types_list.htm). The method takes a single parameter of type `string` that should contain metadata type name and returns a standard JavaScript `Promise` which is when fullfiled returns a `string[]` that contains the names of metadata items and when rejected returns an error message of type `string`.

Please note that not all of the types could be retrieved this way just specifying the type name e.g. you can get all items of type `ApexClass` but not of `AccountSettings` because there is no such type and it should be retrieved by calling `Settings` item of the `Account` type.

### getMetadataItemAsync

This method asynchronously retrieves the metadata item having specified name and of the specified type. The method takes two parameters: type name of type `string` and item name of type `string`. It returns a standard JavaScript `Promise` which is when fullfiled returns a `string` that contains the content of the metadata item and when rejected returns an error message of type `string`. 

Note that only those items that are stored in textual form can be retrieved. E.g. you can retrieve the code inside Apex class or XML description of the custom field but you can't retrieve a static resource that contains image.

## Example

Below is the example controller part of the component that uses `metadataService`. Because of the asynchronous nature of these methods you should use some technique to let the user knows that the operation is in progress. The below example shows a spinner when operations starts and hides it when the operation is finished. Also since the callback typically runs outside of the component rendering cycle, you would want to wrap the continuation logic into `$A.getCallback`

    onLoadItemListRequested: function (cmp, event, helper) {
        var selectedType = cmp.get('v.selectedMetadataType');
        var spinner = cmp.find('spinner');
        $A.util.removeClass(spinner, "slds-hide");
        var metadataService = cmp.find('metadataService');
        metadataService.getMetadataItemListAsync(selectedType)
            .then(function (items) {
                var callback = $A.getCallback(function () {
                    cmp.set('v.metadataItems', items);
                    $A.util.addClass(spinner, "slds-hide");
                });
                callback();
            })
            .catch(function (error) {
                var callback = $A.getCallback(function () {
                    cmp.set('v.metadataItems', []);
                    $A.util.addClass(spinner, "slds-hide");
                    var toast = $A.get('e.force:showToast');
                    if (toast) {
                        toast.setParams({
                            title: 'Error',
                            message: error,
                            type: 'error',
                            timeout: 2000,
                            mode: 'dismissible' //Use 'sticky' to close only after user clicks the button
                        });
                        toast.fire();
                    }
                });
                callback();
            });
        }
    },
    
    onLoadItemRequested: function (cmp, event, helper) {
        var type = cmp.get('v.selectedMetadataType');
        var name = cmp.get('v.selectedMetadataItem');
        var spinner = cmp.find('spinner');
        $A.util.removeClass(spinner, "slds-hide");
        var metadataService = cmp.find('metadataService');
        metadataService.getMetadataItemAsync(type, name)
            .then(function (itemContent) {
                var callback = $A.getCallback(function () {
                    cmp.set('v.metadataItemContents', itemContent);
                    $A.util.addClass(spinner, "slds-hide");
                });
                callback();
            })
            .catch(function (error) {
                var callback = $A.getCallback(function () {                   
                    cmp.set('v.metadataItemContents', null);
                    $A.util.addClass(spinner, "slds-hide");
                    $A.util.addClass(spinner, "slds-hide");
                    var toast = $A.get('e.force:showToast');
                    if (toast) {
                        toast.setParams({
                            title: 'Error',
                            message: error,
                            type: 'error',
                            timeout: 2000,
                            mode: 'dismissible' //Use 'sticky' to close only after user clicks the button
                        });
                        toast.fire();
                    }
                });
                callback();
            });
    }
