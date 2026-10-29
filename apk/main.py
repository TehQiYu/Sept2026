
from math import sin
from kivy.app import App
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.scatter import Scatter
from kivy.uix.floatlayout import FloatLayout

class FirstKivy(App):
    def build(self):
       ## button=Button(text="hello",font_size=100,background_color=(1,0,1,1))
       ## return button
        layout=FloatLayout()
        s = Scatter()
        label=Label(text="hello",font_size=100)
        layout.add_widget(s)
        s.add_widget(label)
        return layout
                
FirstKivy().run()
