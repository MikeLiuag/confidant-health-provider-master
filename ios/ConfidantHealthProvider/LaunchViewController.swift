//
//  LaunchViewController.swift
//  ConfidantHealthProvider
//
//  Created by Stella on 16/10/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

import UIKit
import Lottie

class LaunchViewController: UIViewController {

//  @IBOutlet weak var contentView: UIView!
  var animationView:AnimationView = AnimationView(name: "circle_animation")
  override func viewDidLoad(){
    super.viewDidLoad()
    
    
    animationView.frame = CGRect(x: 0, y: 0, width: 230, height: 230)
    animationView.loopMode = .loop
    animationView.contentMode = .scaleAspectFit
    animationView.center = CGPoint.init(x: self.view.center.x, y: self.view.center.y - 80)
    
    animationView.animationSpeed = 0.9

    view.addSubview(animationView)
    self.view.bringSubviewToFront(animationView)
  }
  
  override func viewWillAppear(_ animated: Bool) {
    animationView.play()
  }
}
