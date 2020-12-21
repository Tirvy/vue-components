Component to make a drop down with hierarchy and base-element.

input:

data: An array of objects with 'id' and 'name' fields.
Might as well have parent/pid/parent_id fields for hierarchy

value/v-model: array of IDs from 'data' array, which are currently selected.
By default, selecting all children of a parent automatically selects their parent instead and visa-versa

options: an object may have following fields:

      container_class_name: drop-down list container css-class. Default: 'w360px'

      button_text_type: the way button text is computed. May be of next variants:
          'list': lists all chosen DATA names or 'none' or 'all'
          'unit_number': forms text as '%units%: %output.length%'
          default: list if length === 1 or 'all', else unit_number

      base: indicates the way to represent 'all' element. Possible values:
          'mimic': creates dummy first element as 'all', but really checking only level of elements
          'filtered': creates dummy element to act as 'all visible' aka 'all filtered'
          true: first element becomes BASE, automatically taking other elements its children
          undefined/false: no base element is present in data list

      force_search: should SEARCH be forcefully visible, even if there are not so many elements (7).
          default: undefined

      units: Element units to show in button_text

      id_key: in case 'id' is not field that stored in VALUE, this field will be used instead
      
      show_id: should 'id' be visible. Default: false
