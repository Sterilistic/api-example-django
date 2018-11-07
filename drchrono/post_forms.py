from django import forms

class PatientCheckinForm(forms.Form):
	'''
	Form for doing check in to meet doctor
	'''
	first_name = forms.CharField(max_length=100, label='First Name', widget=forms.TextInput(attrs={'required': True, 'class': 'form-control autocomplete'}))
	last_name = forms.CharField(max_length=100, label='Last Name', widget=forms.TextInput(attrs={'required': True, 'class': 'form-control autocomplete'}))
	SSN = forms.RegexField(regex='^(\d{3}\-\d{2}\-\d{4})$', label='SSN', error_messages={'invalid': 'Must enter valid US Social Security Number XXX-XX-XXXX'}, widget=forms.TextInput(attrs={'required': True, 'class': 'form-control'}))

	# Handeling form filled with only white spaces
	def clean(self):
		cleaned_data = super(PatientCheckinForm, self).clean()
		first_name = cleaned_data.get("first_name")
		last_name = cleaned_data.get("last_name")
		SSN = cleaned_data.get("SSN")
		msg = "Please enter some texts."
		if first_name and first_name.strip() == "":
			self.add_error('first_name', msg)
		if last_name and last_name.strip() == "":
			self.add_error('last_name', msg)
		if SSN and SSN.strip() == "":
			self.add_error('SSN', msg)


class DemographicsForm(forms.Form):
	'''
	Form for storing demographic values of a patient
	'''
	patient_id = forms.IntegerField(required=False, widget=forms.HiddenInput())
	appointment_id = forms.CharField(required=False, widget=forms.HiddenInput())
	cell_phone = forms.RegexField(required=False, regex='^((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}$', label='Cell Phone', error_messages={'invalid': 'Must enter valid US phone number in the format (999) 999-9999'}, widget=forms.TextInput(attrs={'class': 'form-control'}))
	email = forms.EmailField(required=False, label='Email', widget=forms.EmailInput(attrs={'class': 'form-control'}))
	zip_code = forms.RegexField(required=False, regex='^\d{5}$', label='Zip Code', error_messages={'invalid': 'Enter a valid zip-code in the format 00000'}, widget=forms.TextInput(attrs={'class': 'form-control'}))
	address = forms.CharField(required=False, label='Address', widget=forms.TextInput(attrs={'class': 'form-control'}))
	emergency_contact_phone = forms.RegexField(required=False, regex='^((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}$', label='Emergency Cell Phone', error_messages={'invalid': 'Must enter valid US phone number in the format (999) 999-9999'}, widget=forms.TextInput(attrs={'class': 'form-control'}))
	emergency_contact_name = forms.CharField(required=False, max_length=100, label='Emergency Contact Name', widget=forms.TextInput(attrs={'class': 'form-control'}))
	initial_form_data = forms.CharField(required=False, widget=forms.HiddenInput())
